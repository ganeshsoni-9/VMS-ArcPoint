import Department from "../models/Department.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const items = await Department.find().sort({ name: 1 });
  res.json({ success: true, message: "OK", data: { items } });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  await logAudit({ actor: req.user._id, action: "CREATE_DEPARTMENT", entityType: "Department", entityId: department._id, ip: req.ip });
  res.status(201).json({ success: true, message: "Department created", data: { department } });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) return res.status(404).json({ success: false, message: "Department not found", errors: [] });
  res.json({ success: true, message: "Department updated", data: { department } });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!department) return res.status(404).json({ success: false, message: "Department not found", errors: [] });
  res.json({ success: true, message: "Department deactivated", data: { department } });
});
