import { Router } from "express";
import {
  submitRegistration,
  getRegistrationStatus,
  listRegistrations,
  getRegistrationDetails,
  approveRegistration,
  rejectRegistration,
} from "../controllers/registrationController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// Public routes
router.post("/", submitRegistration);
router.get("/status/:id", getRegistrationStatus);

// Admin-only routes
router.get("/", requireAuth, requireRole("admin"), listRegistrations);
router.get("/:id", requireAuth, requireRole("admin"), getRegistrationDetails);
router.post("/:id/approve", requireAuth, requireRole("admin"), approveRegistration);
router.post("/:id/reject", requireAuth, requireRole("admin"), rejectRegistration);

export default router;
