import { Router } from "express";
import {
  listOrgs,
  getOrg,
  createOrg,
  updateOrg,
  addMember,
  removeMember,
  myOrgs,
} from "../controllers/orgs.controller";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", listOrgs);
router.get("/mine", authenticate, myOrgs);
router.get("/:id", getOrg);
router.post("/", authenticate, createOrg);
router.put("/:orgId", authenticate, requireRole("admin"), updateOrg);
router.post("/:orgId/members", authenticate, requireRole("admin", "officer"), addMember);
router.delete("/:orgId/members/:userId", authenticate, requireRole("admin"), removeMember);

export default router;
