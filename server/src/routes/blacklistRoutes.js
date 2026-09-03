import { Router } from "express";
import { listBlacklist, addBlacklist, updateBlacklist, deleteBlacklist } from "../controllers/blacklistController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));
router.get("/", listBlacklist);
router.post("/", addBlacklist);
router.patch("/:id", updateBlacklist);
router.delete("/:id", deleteBlacklist);
export default router;
