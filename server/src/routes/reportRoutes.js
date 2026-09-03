import { Router } from "express";
import { dashboard, rangeReport, repeatVisitors, exportCsv } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth);
router.get("/dashboard", requireRole("admin", "receptionist"), dashboard);
router.get("/range", requireRole("admin", "receptionist"), rangeReport);
router.get("/repeat-visitors", requireRole("admin"), repeatVisitors);
router.get("/export/csv", requireRole("admin", "receptionist"), exportCsv);
export default router;
