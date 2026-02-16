import { Request, Response } from "express";
import { Event } from "../models/Event";
import { getMysqlPool } from "../config/database";
import { slugify } from "../utils/slug";
import { v4 as uuid } from "uuid";
import { generateTicketQR } from "../services/qr";

// ── List events with search, filters, pagination ──
export async function listEvents(req: Request, res: Response): Promise<void> {
  try {
    const {
      q,
      tag,
      org,
      startDate,
      endDate,
      page = "1",
      limit = "12",
    } = req.query;

    const filter: any = { isPublished: true };

    if (q) {
      filter.$text = { $search: q as string };
    }
    if (tag) {
      filter.tags = { $in: (tag as string).split(",") };
    }
    if (org) {
      filter.orgId = org;
    }
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate as string);
      if (endDate) filter.startDate.$lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      Event.countDocuments(filter),
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    console.error("List events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}

// ── Recommended events feed ──
export async function recommendedEvents(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    let userTags: string[] = [];

    if (userId) {
      // Get tags from events the user has RSVPed to
      const db = getMysqlPool();
      const [tickets] = await db.execute(
        "SELECT event_id FROM tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
        [userId]
      );
      const eventIds = (tickets as any[]).map((t) => t.event_id);

      if (eventIds.length) {
        const pastEvents = await Event.find({ _id: { $in: eventIds } })
          .select("tags")
          .lean();
        userTags = [...new Set(pastEvents.flatMap((e) => e.tags))];
      }
    }

    const filter: any = {
      isPublished: true,
      startDate: { $gte: new Date() },
    };

    if (userTags.length) {
      filter.tags = { $in: userTags };
    }

    const events = await Event.find(filter)
      .sort(userTags.length ? { rsvpCount: -1 } : { startDate: 1 })
      .limit(12)
      .lean();

    res.json({ events });
  } catch (err) {
    console.error("Recommended events error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
}

// ── Get single event ──
export async function getEvent(req: Request, res: Response): Promise<void> {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ event });
  } catch (err) {
    console.error("Get event error:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
}

// ── Create event ──
export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      description,
      orgId,
      orgName,
      location,
      isVirtual,
      virtualLink,
      startDate,
      endDate,
      tags,
      capacity,
      ticketPrice,
      coverImage,
    } = req.body;

    const event = await Event.create({
      title,
      slug: slugify(title),
      description,
      orgId,
      orgName,
      location,
      isVirtual: isVirtual || false,
      virtualLink,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tags: tags || [],
      capacity: capacity || 100,
      ticketPrice: ticketPrice || 0,
      isFree: !ticketPrice || ticketPrice === 0,
      coverImage,
      isPublished: true,
      createdBy: req.user!.userId,
    });

    res.status(201).json({ event });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
}

// ── Update event ──
export async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ event });
  } catch (err) {
    console.error("Update event error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
}

// ── Delete event ──
export async function deleteEvent(req: Request, res: Response): Promise<void> {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
}

// ── RSVP / Get ticket ──
export async function rsvpEvent(req: Request, res: Response): Promise<void> {
  try {
    const eventId = req.params.id;
    const userId = req.user!.userId;
    const db = getMysqlPool();

    // Check if already registered
    const [existing] = await db.execute(
      "SELECT id FROM tickets WHERE event_id = ? AND user_id = ? AND status = 'active'",
      [eventId, userId]
    );
    if ((existing as any[]).length) {
      res.status(409).json({ error: "Already registered for this event" });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (event.rsvpCount >= event.capacity) {
      res.status(409).json({ error: "Event is full" });
      return;
    }

    const ticketId = uuid();
    const qrCode = await generateTicketQR({
      ticketId,
      eventId,
      userId,
    });

    await db.execute(
      "INSERT INTO tickets (id, event_id, user_id, type, price, qr_code) VALUES (?, ?, ?, ?, ?, ?)",
      [ticketId, eventId, userId, event.isFree ? "free" : "paid", event.ticketPrice, qrCode]
    );

    await Event.findByIdAndUpdate(eventId, { $inc: { rsvpCount: 1 } });

    res.status(201).json({
      ticket: {
        id: ticketId,
        eventId,
        qrCode,
        type: event.isFree ? "free" : "paid",
        price: event.ticketPrice,
      },
    });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
}
