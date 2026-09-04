import Visit from "../models/Visit.js";
import Notification from "../models/Notification.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";
import { sendVisitorApprovedEmail, sendVisitorRejectedEmail } from "../utils/email.js";

export const listVisits = asyncHandler(async (req, res) => {
  const { status, department, host, from, to, page = 1, limit = 10 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (host) query.host = host;
  if (from || to) {
    query.visitDate = {};
    if (from) query.visitDate.$gte = new Date(from);
    if (to) query.visitDate.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Visit.find(query)
      .populate("visitor", "name mobile organisation email")
      .populate("host", "name email phone")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Visit.countDocuments(query),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { items, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

export const getCurrentlyInside = asyncHandler(async (req, res) => {
  const items = await Visit.find({ status: "INSIDE" })
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name")
    .sort({ checkInTime: -1 });

  res.json({ success: true, message: "OK", data: { items } });
});

export const approveVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id)
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name");

  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  const hostIdStr = visit.host?._id ? visit.host._id.toString() : visit.host.toString();
  const isHost =
    (req.user.employee && hostIdStr === req.user.employee.toString()) ||
    hostIdStr === req.user._id.toString();

  if (!isHost) {
    return res.status(403).json({ success: false, message: "You are not authorized to approve this visitor request", errors: [] });
  }

  if (visit.status !== "PENDING") {
    return res.status(400).json({ success: false, message: "This request has already been processed", errors: [] });
  }

  visit.status = "APPROVED";
  visit.hostResponse = "APPROVED";
  visit.hostResponseTime = new Date();
  visit.approvedAt = new Date();
  visit.approvedBy = req.user._id;
  await visit.save();

  await Notification.create({
    recipient: visit.host._id || visit.host,
    type: "VISIT_APPROVED",
    title: "Visitor Request Approved",
    message: `You approved visitor request for ${visit.visitor?.name || "visitor"} (${visit.visitorPassId})`,
    relatedVisit: visit._id,
  });

  await logAudit({
    actor: req.user._id,
    action: "APPROVE_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    metadata: { visitorPassId: visit.visitorPassId, visitorName: visit.visitor?.name },
    ip: req.ip,
  });

  const employeeEmail = visit.host?.email || req.user.email;
  const employeeName = visit.host?.name || req.user.name;
  await sendVisitorApprovedEmail({
    employeeEmail,
    employeeName,
    visitorName: visit.visitor?.name,
    visitorPassId: visit.visitorPassId,
    purpose: visit.purpose,
    visitDate: visit.visitDate,
  });

  res.json({ success: true, message: "Visitor request approved successfully", data: { visit } });
});

export const rejectVisit = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const visit = await Visit.findById(req.params.id)
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name");

  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  const hostIdStr = visit.host?._id ? visit.host._id.toString() : visit.host.toString();
  const isHost =
    (req.user.employee && hostIdStr === req.user.employee.toString()) ||
    hostIdStr === req.user._id.toString();

  if (!isHost) {
    return res.status(403).json({ success: false, message: "You are not authorized to reject this visitor request", errors: [] });
  }

  if (visit.status !== "PENDING") {
    return res.status(400).json({ success: false, message: "This request has already been processed", errors: [] });
  }

  const rejectionReason = reason || "No specific reason provided";
  visit.status = "REJECTED";
  visit.hostResponse = "REJECTED";
  visit.hostResponseTime = new Date();
  visit.rejectedAt = new Date();
  visit.rejectedBy = req.user._id;
  visit.rejectionReason = rejectionReason;
  visit.denialReason = rejectionReason;
  visit.activeVisitor = null;
  await visit.save();

  await Notification.create({
    recipient: visit.host._id || visit.host,
    type: "VISIT_REJECTED",
    title: "Visitor Request Rejected",
    message: `You rejected visitor request for ${visit.visitor?.name || "visitor"} (${visit.visitorPassId})`,
    relatedVisit: visit._id,
  });

  await logAudit({
    actor: req.user._id,
    action: "REJECT_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    metadata: { visitorPassId: visit.visitorPassId, visitorName: visit.visitor?.name, rejectionReason },
    ip: req.ip,
  });

  const employeeEmail = visit.host?.email || req.user.email;
  const employeeName = visit.host?.name || req.user.name;
  await sendVisitorRejectedEmail({
    employeeEmail,
    employeeName,
    visitorName: visit.visitor?.name,
    visitorPassId: visit.visitorPassId,
    purpose: visit.purpose,
    rejectionReason,
  });

  res.json({ success: true, message: "Visitor request rejected", data: { visit } });
});

export const checkIn = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id).populate("visitor", "name mobile organisation");
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (visit.status !== "APPROVED") {
    return res.status(400).json({ success: false, message: "Only approved visitors can be checked in", errors: [] });
  }

  visit.status = "INSIDE";
  visit.checkInTime = new Date();
  await visit.save();

  await Notification.create({
    recipient: visit.host,
    type: "VISITOR_CHECKED_IN",
    title: "Visitor Checked In",
    message: `${visit.visitor?.name || "Visitor"} has checked in and is currently inside the office.`,
    relatedVisit: visit._id,
  });

  await logAudit({
    actor: req.user._id,
    action: "CHECK_IN_VISITOR",
    entityType: "Visit",
    entityId: visit._id,
    metadata: { visitorPassId: visit.visitorPassId, visitorName: visit.visitor?.name },
    ip: req.ip,
  });

  res.json({ success: true, message: "Visitor checked in successfully", data: { visit } });
});

export const checkOut = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id).populate("visitor", "name mobile organisation");
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (visit.status !== "INSIDE") {
    return res.status(400).json({ success: false, message: "Only visitors currently inside can be checked out", errors: [] });
  }

  visit.checkOutTime = new Date();
  visit.status = "COMPLETED";
  visit.activeVisitor = null;
  await visit.save();

  const durationMs = visit.checkOutTime - visit.checkInTime;
  const durationMinutes = Math.round(durationMs / 60000);

  await Notification.create({
    recipient: visit.host,
    type: "VISITOR_CHECKED_OUT",
    title: "Visitor Checked Out",
    message: `${visit.visitor?.name || "Visitor"} has checked out successfully.`,
    relatedVisit: visit._id,
  });

  await logAudit({
    actor: req.user._id,
    action: "CHECK_OUT_VISITOR",
    entityType: "Visit",
    entityId: visit._id,
    metadata: { visitorPassId: visit.visitorPassId, visitorName: visit.visitor?.name, durationMinutes },
    ip: req.ip,
  });

  res.json({ success: true, message: "Visitor checked out successfully", data: { visit, durationMinutes } });
});

export const cancelVisit = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const visit = await Visit.findById(req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (!["PENDING", "APPROVED"].includes(visit.status)) {
    return res.status(400).json({ success: false, message: "This visit can no longer be cancelled", errors: [] });
  }

  visit.status = "CANCELLED";
  visit.cancellationReason = reason || "";
  visit.activeVisitor = null;
  await visit.save();

  await logAudit({ actor: req.user._id, action: "CANCEL_VISIT", entityType: "Visit", entityId: visit._id, ip: req.ip });

  res.json({ success: true, message: "Visit cancelled", data: { visit } });
});
