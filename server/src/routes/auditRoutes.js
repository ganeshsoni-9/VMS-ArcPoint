import { Router } from "express";
import { listAuditLogs } from "../controllers/auditController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.get("/", requireAuth, requireRole("admin"), listAuditLogs);
export default router;
