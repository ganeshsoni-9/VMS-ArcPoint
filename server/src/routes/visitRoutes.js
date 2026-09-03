import { Router } from "express";
import { listVisits, getCurrentlyInside, checkIn, checkOut, cancelVisit } from "../controllers/visitController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth);
router.get("/", requireRole("admin", "receptionist"), listVisits);
router.get("/currently-inside", requireRole("admin", "receptionist"), getCurrentlyInside);
router.patch("/:id/check-in", requireRole("admin", "receptionist"), checkIn);
router.patch("/:id/check-out", requireRole("admin", "receptionist"), checkOut);
router.patch("/:id/cancel", requireRole("admin", "receptionist"), cancelVisit);
export default router;
