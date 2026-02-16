import { Router } from "express";
import {
  checkInQR,
  checkInManual,
  getCheckIns,
  checkInStats,
} from "../controllers/checkin.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/qr", authenticate, checkInQR);
router.post("/manual", authenticate, checkInManual);
router.get("/event/:eventId", authenticate, getCheckIns);
router.get("/event/:eventId/stats", authenticate, checkInStats);

export default router;
