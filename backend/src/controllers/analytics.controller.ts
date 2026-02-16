import { Request, Response } from "express";
import { Event } from "../models/Event";
import { CheckIn } from "../models/CheckIn";
import { AnalyticsSnapshot } from "../models/Analytics";
import { getMysqlPool } from "../config/database";

// ── Dashboard overview for an org ──
export async function orgDashboard(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const db = getMysqlPool();

    // Total events
    const totalEvents = await Event.countDocuments({ orgId });

    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      orgId,
      startDate: { $gte: new Date() },
    });

    // Total RSVPs across all events
    const rsvpAgg = await Event.aggregate([
      { $match: { orgId } },
      { $group: { _id: null, totalRSVPs: { $sum: "$rsvpCount" } } },
    ]);
    const totalRSVPs = rsvpAgg[0]?.totalRSVPs || 0;

    // Total check-ins
    const orgEvents = await Event.find({ orgId }).select("_id").lean();
    const eventIds = orgEvents.map((e) => e._id.toString());
    const totalCheckIns = await CheckIn.countDocuments({
      eventId: { $in: eventIds },
    });

    // Members count
    const [memberRows] = await db.execute(
      "SELECT COUNT(*) as count FROM memberships WHERE org_id = ?",
      [orgId]
    );
    const totalMembers = (memberRows as any[])[0].count;

    // Revenue
    const [revenueRows] = await db.execute(
      `SELECT COALESCE(SUM(t.price), 0) as revenue 
       FROM tickets t 
       WHERE t.event_id IN (${eventIds.length ? eventIds.map(() => "?").join(",") : "''"})
       AND t.status != 'cancelled'`,
      eventIds
    );
    const totalRevenue = (revenueRows as any[])[0]?.revenue || 0;

    res.json({
      totalEvents,
      upcomingEvents,
      totalRSVPs,
      totalCheckIns,
      totalMembers,
      totalRevenue,
      checkInRate: totalRSVPs > 0 ? Math.round((totalCheckIns / totalRSVPs) * 100) : 0,
    });
  } catch (err) {
    console.error("Org dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
}

// ── Event-level analytics ──
export async function eventAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const db = getMysqlPool();

    const event = await Event.findById(eventId).lean();
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    // Ticket breakdown
    const [ticketStats] = await db.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status='used' THEN 1 ELSE 0 END) as used,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status!='cancelled' THEN price ELSE 0 END) as revenue
       FROM tickets WHERE event_id = ?`,
      [eventId]
    );
    const stats = (ticketStats as any[])[0];

    // Check-in timeline (hourly)
    const checkIns = await CheckIn.find({ eventId }).sort({ checkedInAt: 1 }).lean();
    const hourlyCheckIns: Record<string, number> = {};
    checkIns.forEach((c) => {
      const hour = new Date(c.checkedInAt).toISOString().slice(0, 13);
      hourlyCheckIns[hour] = (hourlyCheckIns[hour] || 0) + 1;
    });

    // Drop-off = RSVPs - check-ins
    const dropOff = event.rsvpCount - (parseInt(stats.used) || 0);
    const conversionRate =
      event.rsvpCount > 0
        ? Math.round(((parseInt(stats.used) || 0) / event.rsvpCount) * 100)
        : 0;

    res.json({
      event: { title: event.title, startDate: event.startDate },
      tickets: {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        used: parseInt(stats.used) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
      },
      revenue: parseFloat(stats.revenue) || 0,
      attendance: {
        rsvps: event.rsvpCount,
        checkIns: parseInt(stats.used) || 0,
        dropOff,
        conversionRate,
        capacity: event.capacity,
        fillRate: Math.round((event.rsvpCount / event.capacity) * 100),
      },
      hourlyCheckIns: Object.entries(hourlyCheckIns).map(([hour, count]) => ({
        hour,
        count,
      })),
    });
  } catch (err) {
    console.error("Event analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

// ── Attendance trends (last 30 days) ──
export async function attendanceTrends(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await Event.find({
      orgId,
      startDate: { $gte: thirtyDaysAgo },
    })
      .sort({ startDate: 1 })
      .lean();

    const trends = await Promise.all(
      events.map(async (event) => {
        const checkInCount = await CheckIn.countDocuments({
          eventId: event._id.toString(),
        });
        return {
          eventId: event._id,
          title: event.title,
          date: event.startDate,
          rsvps: event.rsvpCount,
          checkIns: checkInCount,
          checkInRate:
            event.rsvpCount > 0
              ? Math.round((checkInCount / event.rsvpCount) * 100)
              : 0,
        };
      })
    );

    res.json({ trends });
  } catch (err) {
    console.error("Attendance trends error:", err);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
}
