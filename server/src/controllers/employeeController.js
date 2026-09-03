import Employee from "../models/Employee.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

export const listEmployees = asyncHandler(async (req, res) => {
  const { department, active } = req.query;
  const query = {};
  if (department) query.department = department;
  if (active !== undefined) query.active = active === "true";
  const items = await Employee.find(query).populate("department", "name").sort({ name: 1 });
  res.json({ success: true, message: "OK", data: { items } });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  await logAudit({ actor: req.user._id, action: "CREATE_EMPLOYEE", entityType: "Employee", entityId: employee._id, ip: req.ip });
  res.status(201).json({ success: true, message: "Employee created", data: { employee } });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate("department", "name");
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found", errors: [] });
  res.json({ success: true, message: "OK", data: { employee } });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found", errors: [] });
  await logAudit({ actor: req.user._id, action: "UPDATE_EMPLOYEE", entityType: "Employee", entityId: employee._id, ip: req.ip });
  res.json({ success: true, message: "Employee updated", data: { employee } });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found", errors: [] });
  await logAudit({ actor: req.user._id, action: "DELETE_EMPLOYEE", entityType: "Employee", entityId: employee._id, ip: req.ip });
  res.json({ success: true, message: "Employee deactivated", data: { employee } });
});
