import { Router } from "express";
import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;
