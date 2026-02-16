import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  sendMagicLink,
  verifyMagicLink,
  me,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/magic-link", sendMagicLink);
router.get("/magic", verifyMagicLink);
router.get("/me", authenticate, me);

export default router;
