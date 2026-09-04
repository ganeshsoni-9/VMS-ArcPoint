import Visit from "../models/Visit.js";
import Notification from "../models/Notification.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";
import {
  sendVisitorApprovedEmail,
  sendVisitorRejectedEmail,
} from "../utils/email.js";

/**
 * GET /visits
 * List all visits with filters and pagination
 */
export const listVisits = asyncHandler(async (req, res) => {
  const {
    status,
    department,
    host,
    from,
    to,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (department) query.department = department;
  if (host) query.host = host;

  if (from || to) {
    query.visitDate = {};

    if (from) {
      query.visitDate.$gte = new Date(from);
    }

    if (to) {
      query.visitDate.$lte = new Date(to);
    }
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [items, total] = await Promise.all([
    Visit.find(query)
      .populate("visitor", "name mobile organisation email")
      .populate("host", "name email phone")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),

    Visit.countDocuments(query),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: {
      items,
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/**
 * GET /visits/currently-inside
 * Get visitors who are currently inside the office
 */
export const getCurrentlyInside = asyncHandler(async (req, res) => {
  const items = await Visit.find({ status: "INSIDE" })
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name")
    .sort({ checkInTime: -1 });

  res.json({
    success: true,
    message: "OK",
    data: {
      items,
    },
  });
});

/**
 * APPROVE VISIT
 *
 * Visitor request:
 * PENDING -> APPROVED
 *
 * After approval:
 * Visitor receives email on visitor's email address.
 */
export const approveVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id)
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name");

  if (!visit) {
    return res.status(404).json({
      success: false,
      message: "Visit not found",
      errors: [],
    });
  }

  /**
   * Check whether logged-in user is the host/employee
   */
  const hostIdStr = visit.host?._id
    ? visit.host._id.toString()
    : visit.host.toString();

  const isHost =
    (req.user.employee &&
      hostIdStr === req.user.employee.toString()) ||
    hostIdStr === req.user._id.toString();

  if (!isHost) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to approve this visitor request",
      errors: [],
    });
  }

  /**
   * Only PENDING visits can be approved
   */
  if (visit.status !== "PENDING") {
    return res.status(400).json({
      success: false,
      message: "This request has already been processed",
      errors: [],
    });
  }

  /**
   * Update visit status
   */
  visit.status = "APPROVED";
  visit.hostResponse = "APPROVED";
  visit.hostResponseTime = new Date();
  visit.approvedAt = new Date();
  visit.approvedBy = req.user._id;

  await visit.save();

  /**
   * Create notification for employee/host
   */
  await Notification.create({
    recipient: visit.host._id || visit.host,
    type: "VISIT_APPROVED",
    title: "Visitor Request Approved",
    message: `You approved visitor request for ${
      visit.visitor?.name || "visitor"
    } (${visit.visitorPassId})`,
    relatedVisit: visit._id,
  });

  /**
   * Audit log
   */
  await logAudit({
    actor: req.user._id,
    action: "APPROVE_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    metadata: {
      visitorPassId: visit.visitorPassId,
      visitorName: visit.visitor?.name,
    },
    ip: req.ip,
  });

  /**
   * IMPORTANT:
   * Email is sent to VISITOR, not employee.
   *
   * visit.visitor.email comes from:
   * .populate("visitor", "name mobile organisation email")
   */
  await sendVisitorApprovedEmail({
    visitorEmail: visit.visitor?.email,
    visitorName: visit.visitor?.name,
    employeeName: visit.host?.name,
    visitorPassId: visit.visitorPassId,
    purpose: visit.purpose,
    visitDate: visit.visitDate,
  });

  res.json({
    success: true,
    message: "Visitor request approved successfully",
    data: {
      visit,
    },
  });
});

/**
 * REJECT VISIT
 *
 * Visitor request:
 * PENDING -> REJECTED
 *
 * After rejection:
 * Visitor receives rejection email.
 */
export const rejectVisit = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const visit = await Visit.findById(req.params.id)
    .populate("visitor", "name mobile organisation email")
    .populate("host", "name email phone")
    .populate("department", "name");

  if (!visit) {
    return res.status(404).json({
      success: false,
      message: "Visit not found",
      errors: [],
    });
  }

  /**
   * Check whether logged-in user is the host/employee
   */
  const hostIdStr = visit.host?._id
    ? visit.host._id.toString()
    : visit.host.toString();

  const isHost =
    (req.user.employee &&
      hostIdStr === req.user.employee.toString()) ||
    hostIdStr === req.user._id.toString();

  if (!isHost) {
    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to reject this visitor request",
      errors: [],
    });
  }

  /**
   * Only PENDING visits can be rejected
   */
  if (visit.status !== "PENDING") {
    return res.status(400).json({
      success: false,
      message: "This request has already been processed",
      errors: [],
    });
  }

  const rejectionReason =
    reason || "No specific reason provided";

  /**
   * Update visit status
   */
  visit.status = "REJECTED";
  visit.hostResponse = "REJECTED";
  visit.hostResponseTime = new Date();
  visit.rejectedAt = new Date();
  visit.rejectedBy = req.user._id;
  visit.rejectionReason = rejectionReason;
  visit.denialReason = rejectionReason;
  visit.activeVisitor = null;

  await visit.save();

  /**
   * Create notification for employee/host
   */
  await Notification.create({
    recipient: visit.host._id || visit.host,
    type: "VISIT_REJECTED",
    title: "Visitor Request Rejected",
    message: `You rejected visitor request for ${
      visit.visitor?.name || "visitor"
    } (${visit.visitorPassId})`,
    relatedVisit: visit._id,
  });

  /**
   * Audit log
   */
  await logAudit({
    actor: req.user._id,
    action: "REJECT_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    metadata: {
      visitorPassId: visit.visitorPassId,
      visitorName: visit.visitor?.name,
      rejectionReason,
    },
    ip: req.ip,
  });

  /**
   * IMPORTANT:
   * Email is sent to VISITOR, not employee.
   */
  await sendVisitorRejectedEmail({
    visitorEmail: visit.visitor?.email,
    visitorName: visit.visitor?.name,
    employeeName: visit.host?.name,
    visitorPassId: visit.visitorPassId,
    purpose: visit.purpose,
    rejectionReason,
  });

  res.json({
    success: true,
    message: "Visitor request rejected",
    data: {
      visit,
    },
  });
});

/**
 * CHECK IN VISITOR
 *
 * APPROVED -> INSIDE
 */
export const checkIn = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id).populate(
    "visitor",
    "name mobile organisation"
  );

  if (!visit) {
    return res.status(404).json({
      success: false,
      message: "Visit not found",
      errors: [],
    });
  }

  /**
   * Only APPROVED visitors can check in
   */
  if (visit.status !== "APPROVED") {
    return res.status(400).json({
      success: false,
      message: "Only approved visitors can be checked in",
      errors: [],
    });
  }

  visit.status = "INSIDE";
  visit.checkInTime = new Date();

  await visit.save();

  /**
   * Notify employee
   */
  await Notification.create({
    recipient: visit.host,
    type: "VISITOR_CHECKED_IN",
    title: "Visitor Checked In",
    message: `${
      visit.visitor?.name || "Visitor"
    } has checked in and is currently inside the office.`,
    relatedVisit: visit._id,
  });

  /**
   * Audit log
   */
  await logAudit({
    actor: req.user._id,
    action: "CHECK_IN_VISITOR",
    entityType: "Visit",
    entityId: visit._id,
    metadata: {
      visitorPassId: visit.visitorPassId,
      visitorName: visit.visitor?.name,
    },
    ip: req.ip,
  });

  res.json({
    success: true,
    message: "Visitor checked in successfully",
    data: {
      visit,
    },
  });
});

/**
 * CHECK OUT VISITOR
 *
 * INSIDE -> COMPLETED
 */
export const checkOut = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id).populate(
    "visitor",
    "name mobile organisation"
  );

  if (!visit) {
    return res.status(404).json({
      success: false,
      message: "Visit not found",
      errors: [],
    });
  }

  /**
   * Only INSIDE visitors can check out
   */
  if (visit.status !== "INSIDE") {
    return res.status(400).json({
      success: false,
      message:
        "Only visitors currently inside can be checked out",
      errors: [],
    });
  }

  visit.checkOutTime = new Date();
  visit.status = "COMPLETED";
  visit.activeVisitor = null;

  await visit.save();

  /**
   * Calculate visit duration
   */
  const durationMs =
    visit.checkOutTime - visit.checkInTime;

  const durationMinutes = Math.round(
    durationMs / 60000
  );

  /**
   * Notify employee
   */
  await Notification.create({
    recipient: visit.host,
    type: "VISITOR_CHECKED_OUT",
    title: "Visitor Checked Out",
    message: `${
      visit.visitor?.name || "Visitor"
    } has checked out successfully.`,
    relatedVisit: visit._id,
  });

  /**
   * Audit log
   */
  await logAudit({
    actor: req.user._id,
    action: "CHECK_OUT_VISITOR",
    entityType: "Visit",
    entityId: visit._id,
    metadata: {
      visitorPassId: visit.visitorPassId,
      visitorName: visit.visitor?.name,
      durationMinutes,
    },
    ip: req.ip,
  });

  res.json({
    success: true,
    message: "Visitor checked out successfully",
    data: {
      visit,
      durationMinutes,
    },
  });
});

/**
 * CANCEL VISIT
 *
 * PENDING / APPROVED -> CANCELLED
 */
export const cancelVisit = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const visit = await Visit.findById(req.params.id);

  if (!visit) {
    return res.status(404).json({
      success: false,
      message: "Visit not found",
      errors: [],
    });
  }

  /**
   * Only PENDING or APPROVED visits can be cancelled
   */
  if (!["PENDING", "APPROVED"].includes(visit.status)) {
    return res.status(400).json({
      success: false,
      message: "This visit can no longer be cancelled",
      errors: [],
    });
  }

  visit.status = "CANCELLED";
  visit.cancellationReason = reason || "";
  visit.activeVisitor = null;

  await visit.save();

  /**
   * Audit log
   */
  await logAudit({
    actor: req.user._id,
    action: "CANCEL_VISIT",
    entityType: "Visit",
    entityId: visit._id,
    ip: req.ip,
  });

  res.json({
    success: true,
    message: "Visit cancelled",
    data: {
      visit,
    },
  });
});