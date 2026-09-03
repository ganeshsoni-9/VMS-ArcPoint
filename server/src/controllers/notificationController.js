import Notification from "../models/Notification.js";
import { asyncHandler } from "../middleware/error.js";

export const listNotifications = asyncHandler(async (req, res) => {
  if (!req.user.employee) {
    return res.json({ success: true, message: "OK", data: { items: [], unreadCount: 0 } });
  }
  const items = await Notification.find({ recipient: req.user.employee }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user.employee, isRead: false });
  res.json({ success: true, message: "OK", data: { items, unreadCount } });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.employee },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found", errors: [] });
  res.json({ success: true, message: "OK", data: { notification } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.employee, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read", data: {} });
});
