import { Router } from "express";
import {
  listEvents,
  recommendedEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
} from "../controllers/events.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listEvents);
router.get("/recommended", authenticate, recommendedEvents);
router.get("/:id", getEvent);
router.post("/", authenticate, createEvent);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);
router.post("/:id/rsvp", authenticate, rsvpEvent);

export default router;
