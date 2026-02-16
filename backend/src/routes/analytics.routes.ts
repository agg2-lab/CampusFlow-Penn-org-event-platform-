import { Router } from "express";
import {
  orgDashboard,
  eventAnalytics,
  attendanceTrends,
} from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/org/:orgId/dashboard", authenticate, orgDashboard);
router.get("/event/:eventId", authenticate, eventAnalytics);
router.get("/org/:orgId/trends", authenticate, attendanceTrends);

export default router;
