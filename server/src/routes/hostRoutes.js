import { Router } from "express";
import { listMyRequests, getEmployeeDashboard, approveRequest, rejectRequest } from "../controllers/hostController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth, requireRole("employee"));
router.get("/dashboard", getEmployeeDashboard);
router.get("/requests", listMyRequests);
router.patch("/requests/:id/approve", approveRequest);
router.patch("/requests/:id/reject", rejectRequest);
export default router;
