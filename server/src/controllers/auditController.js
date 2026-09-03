import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../middleware/error.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { action, page = 1, limit = 20 } = req.query;
  const query = {};
  if (action) query.action = action;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    AuditLog.find(query).populate("actor", "email role").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    AuditLog.countDocuments(query),
  ]);
  res.json({ success: true, message: "OK", data: { items, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } });
});
