import Blacklist from "../models/Blacklist.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

export const listBlacklist = asyncHandler(async (req, res) => {
  const items = await Blacklist.find().sort({ createdAt: -1 });
  res.json({ success: true, message: "OK", data: { items } });
});

export const addBlacklist = asyncHandler(async (req, res) => {
  const entry = await Blacklist.create({ ...req.body, createdBy: req.user._id });
  await logAudit({ actor: req.user._id, action: "BLACKLIST_VISITOR", entityType: "Blacklist", entityId: entry._id, ip: req.ip });
  res.status(201).json({ success: true, message: "Added to blacklist", data: { entry } });
});

export const updateBlacklist = asyncHandler(async (req, res) => {
  const entry = await Blacklist.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found", errors: [] });
  await logAudit({ actor: req.user._id, action: entry.active ? "BLACKLIST_VISITOR" : "REMOVE_BLACKLIST", entityType: "Blacklist", entityId: entry._id, ip: req.ip });
  res.json({ success: true, message: "Updated", data: { entry } });
});

export const deleteBlacklist = asyncHandler(async (req, res) => {
  const entry = await Blacklist.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found", errors: [] });
  await logAudit({ actor: req.user._id, action: "REMOVE_BLACKLIST", entityType: "Blacklist", entityId: entry._id, ip: req.ip });
  res.json({ success: true, message: "Removed from blacklist", data: {} });
});
