import { Router } from "express";
import { listEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();
router.use(requireAuth);
router.get("/", requireRole("admin", "receptionist"), listEmployees); // receptionist needs this for the host dropdown
router.post("/", requireRole("admin"), createEmployee);
router.get("/:id", requireRole("admin"), getEmployee);
router.put("/:id", requireRole("admin"), updateEmployee);
router.delete("/:id", requireRole("admin"), deleteEmployee);
export default router;
