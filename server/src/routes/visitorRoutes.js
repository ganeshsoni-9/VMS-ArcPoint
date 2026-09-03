import { Router } from "express";
import { registerVisitor, listVisitors, getVisitor, getVisitorDocument } from "../controllers/visitorController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth);
router.post("/", requireRole("admin", "receptionist"), registerVisitor);
router.get("/", requireRole("admin", "receptionist"), listVisitors);
router.get("/:id", requireRole("admin", "receptionist"), getVisitor);
router.get("/:id/document", requireRole("admin", "receptionist"), getVisitorDocument);
export default router;
