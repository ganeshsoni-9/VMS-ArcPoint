import Visit from "../models/Visit.js";
import Notification from "../models/Notification.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

export const listMyRequests = asyncHandler(async (req, res) => {
  if (!req.user.employee) {
    return res.status(403).json({ success: false, message: "No employee profile linked to this account", errors: [] });
  }
  const { status } = req.query;
  const query = { host: req.user.employee };
  if (status) query.status = status;

  const items = await Visit.find(query)
    .populate("visitor", "name mobile organisation")
    .populate("department", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, message: "OK", data: { items } });
});

export const getEmployeeDashboard = asyncHandler(async (req, res) => {
  if (!req.user.employee) {
    return res.status(403).json({
      success: false,
      message: "No employee profile linked to this account",
      errors: [],
    });
  }

  const hostId = req.user.employee;
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    currentlyInsideCount,
    pendingRequests,
    todayVisitors,
    currentlyInsideVisitors,
    recentNotifications,
    unreadNotificationCount,
  ] = await Promise.all([
    Visit.countDocuments({ host: hostId, status: "PENDING" }),
    Visit.countDocuments({ host: hostId, status: { $in: ["APPROVED", "COMPLETED", "INSIDE"] } }),
    Visit.countDocuments({ host: hostId, status: "REJECTED" }),
    Visit.countDocuments({ host: hostId, status: "INSIDE" }),

    // Pending requests list
    Visit.find({ host: hostId, status: "PENDING" })
      .populate("visitor", "name mobile organisation")
      .populate("department", "name")
      .sort({ createdAt: -1 }),

    // Today's visitors list
    Visit.find({
      host: hostId,
      visitDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("visitor", "name mobile organisation")
      .populate("department", "name")
      .sort({ createdAt: -1 }),

    // Currently inside visitors list
    Visit.find({ host: hostId, status: "INSIDE" })
      .populate("visitor", "name mobile organisation")
      .populate("department", "name")
      .sort({ checkInTime: -1 }),

    // Recent Notifications
    Notification.find({ recipient: hostId }).sort({ createdAt: -1 }).limit(5),

    // Unread count
    Notification.countDocuments({ recipient: hostId, isRead: false }),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: {
      summary: {
        pendingRequests: pendingCount,
        approvedRequests: approvedCount,
        rejectedRequests: rejectedCount,
        currentlyInside: currentlyInsideCount,
      },
      pendingRequests,
      todayVisitors,
      currentlyInsideVisitors,
      recentNotifications,
      unreadNotificationCount,
    },
  });
});

async function respond(req, res, decision) {
  const visit = await Visit.findById(req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (!req.user.employee || visit.host.toString() !== req.user.employee.toString()) {
    return res.status(403).json({ success: false, message: "You are not the host for this visit", errors: [] });
  }
  if (visit.status !== "PENDING") {
    return res.status(400).json({ success: false, message: "This request has already been responded to", errors: [] });
  }

  visit.status = decision === "APPROVED" ? "APPROVED" : "REJECTED";
  visit.hostResponse = decision;
  visit.hostResponseTime = new Date();
  if (decision === "REJECTED") {
    visit.denialReason = req.body.reason || "";
    visit.activeVisitor = null;
  }
  await visit.save();

  await Notification.create({
    recipient: visit.host,
    type: "VISIT_RESPONSE_RECORDED",
    title: `Visit ${decision.toLowerCase()}`,
    message: `You ${decision.toLowerCase()} visit ${visit.visitorPassId}`,
    relatedVisit: visit._id,
    isRead: true,
  });

  await logAudit({
    actor: req.user._id,
    action: decision === "APPROVED" ? "APPROVE_VISIT" : "REJECT_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    ip: req.ip,
  });

  res.json({ success: true, message: `Visit ${decision.toLowerCase()}`, data: { visit } });
}

export const approveRequest = asyncHandler((req, res) => respond(req, res, "APPROVED"));
export const rejectRequest = asyncHandler((req, res) => respond(req, res, "REJECTED"));
