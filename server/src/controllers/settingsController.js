import Settings from "../models/Settings.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, message: "OK", data: { settings } });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings({});
  Object.assign(settings, req.body);
  await settings.save();
  await logAudit({ actor: req.user._id, action: "CHANGE_SETTINGS", entityType: "Settings", entityId: settings._id, ip: req.ip });
  res.json({ success: true, message: "Settings updated", data: { settings } });
});
