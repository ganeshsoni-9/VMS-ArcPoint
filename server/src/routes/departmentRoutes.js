import { Router } from "express";
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departmentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// Public route for unauthenticated registration dropdowns
router.get("/public", listDepartments);

router.use(requireAuth);
router.get("/", listDepartments); // all authenticated roles may read departments
router.post("/", requireRole("admin"), createDepartment);
router.put("/:id", requireRole("admin"), updateDepartment);
router.delete("/:id", requireRole("admin"), deleteDepartment);

export default router;
