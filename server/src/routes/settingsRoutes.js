import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));
router.get("/", getSettings);
router.put("/", updateSettings);
export default router;
