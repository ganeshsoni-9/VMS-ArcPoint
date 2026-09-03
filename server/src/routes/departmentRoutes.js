import { Router } from "express";
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth);
router.get("/", listDepartments); // all roles may read departments (needed for forms)
router.post("/", requireRole("admin"), createDepartment);
router.put("/:id", requireRole("admin"), updateDepartment);
router.delete("/:id", requireRole("admin"), deleteDepartment);
export default router;
