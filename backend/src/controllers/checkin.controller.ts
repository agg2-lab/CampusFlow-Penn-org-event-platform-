import { Request, Response } from "express";
import { CheckIn } from "../models/CheckIn";
import { getMysqlPool } from "../config/database";
import { parseQRData } from "../services/qr";

// ── Check in via QR code ──
export async function checkInQR(req: Request, res: Response): Promise<void> {
  try {
    const { qrData } = req.body;
    const payload = parseQRData(qrData);

    if (!payload) {
      res.status(400).json({ error: "Invalid QR code" });
      return;
    }

    const db = getMysqlPool();

    // Verify ticket exists and is active
    const [tickets] = await db.execute(
      "SELECT id, event_id, user_id, status FROM tickets WHERE id = ? AND event_id = ?",
      [payload.ticketId, payload.eventId]
    );
    const ticketList = tickets as any[];

    if (!ticketList.length) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    if (ticketList[0].status === "used") {
      res.status(409).json({ error: "Ticket already used" });
      return;
    }

    if (ticketList[0].status === "cancelled") {
      res.status(409).json({ error: "Ticket was cancelled" });
      return;
    }

    // Check for duplicate check-in
    const existingCheckIn = await CheckIn.findOne({
      ticketId: payload.ticketId,
    });
    if (existingCheckIn) {
      res.status(409).json({ error: "Already checked in" });
      return;
    }

    // Record check-in
    const checkIn = await CheckIn.create({
      eventId: payload.eventId,
      userId: payload.userId,
      ticketId: payload.ticketId,
      method: "qr",
      checkedInBy: req.user!.userId,
    });

    // Mark ticket as used
    await db.execute("UPDATE tickets SET status = 'used' WHERE id = ?", [
      payload.ticketId,
    ]);

    // Get attendee name
    const [userRows] = await db.execute(
      "SELECT name, email FROM users WHERE id = ?",
      [payload.userId]
    );
    const attendee = (userRows as any[])[0];

    res.json({
      checkIn: {
        id: checkIn._id,
        attendee: attendee
          ? { name: attendee.name, email: attendee.email }
          : null,
        method: "qr",
        checkedInAt: checkIn.checkedInAt,
      },
    });
  } catch (err) {
    console.error("QR check-in error:", err);
    res.status(500).json({ error: "Check-in failed" });
  }
}

// ── Manual check-in by name/email ──
export async function checkInManual(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { eventId, userId } = req.body;
    const db = getMysqlPool();

    // Find active ticket
    const [tickets] = await db.execute(
      "SELECT id FROM tickets WHERE event_id = ? AND user_id = ? AND status = 'active'",
      [eventId, userId]
    );
    const ticketList = tickets as any[];

    if (!ticketList.length) {
      res.status(404).json({ error: "No active ticket found for this user" });
      return;
    }

    const ticketId = ticketList[0].id;

    const checkIn = await CheckIn.create({
      eventId,
      userId,
      ticketId,
      method: "manual",
      checkedInBy: req.user!.userId,
    });

    await db.execute("UPDATE tickets SET status = 'used' WHERE id = ?", [
      ticketId,
    ]);

    res.json({
      checkIn: {
        id: checkIn._id,
        method: "manual",
        checkedInAt: checkIn.checkedInAt,
      },
    });
  } catch (err) {
    console.error("Manual check-in error:", err);
    res.status(500).json({ error: "Check-in failed" });
  }
}

// ── Get check-in list for an event ──
export async function getCheckIns(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const checkIns = await CheckIn.find({ eventId })
      .sort({ checkedInAt: -1 })
      .lean();

    // Enrich with user names
    if (checkIns.length) {
      const db = getMysqlPool();
      const userIds = [...new Set(checkIns.map((c) => c.userId))];
      const placeholders = userIds.map(() => "?").join(",");
      const [userRows] = await db.execute(
        `SELECT id, name, email, avatar_url FROM users WHERE id IN (${placeholders})`,
        userIds
      );
      const userMap = new Map(
        (userRows as any[]).map((u) => [u.id, u])
      );

      const enriched = checkIns.map((c) => ({
        ...c,
        attendee: userMap.get(c.userId) || null,
      }));

      res.json({ checkIns: enriched, total: enriched.length });
    } else {
      res.json({ checkIns: [], total: 0 });
    }
  } catch (err) {
    console.error("Get check-ins error:", err);
    res.status(500).json({ error: "Failed to fetch check-ins" });
  }
}

// ── Check-in stats for an event ──
export async function checkInStats(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const db = getMysqlPool();

    const [ticketRows] = await db.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status='used' THEN 1 ELSE 0 END) as checked_in FROM tickets WHERE event_id = ?",
      [eventId]
    );
    const stats = (ticketRows as any[])[0];

    res.json({
      totalTickets: stats.total,
      checkedIn: parseInt(stats.checked_in) || 0,
      checkInRate:
        stats.total > 0
          ? Math.round((parseInt(stats.checked_in || 0) / stats.total) * 100)
          : 0,
    });
  } catch (err) {
    console.error("Check-in stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
