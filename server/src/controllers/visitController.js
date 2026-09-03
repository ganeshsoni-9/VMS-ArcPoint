import Visit from "../models/Visit.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

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
      .populate("visitor", "name mobile organisation")
      .populate("host", "name")
      .populate("department", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Visit.countDocuments(query),
  ]);

  res.json({ success: true, message: "OK", data: { items, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } });
});

export const getCurrentlyInside = asyncHandler(async (req, res) => {
  const items = await Visit.find({ status: "INSIDE" })
    .populate("visitor", "name mobile organisation")
    .populate("host", "name")
    .populate("department", "name")
    .sort({ checkInTime: -1 });
  res.json({ success: true, message: "OK", data: { items } });
});

export const checkIn = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (visit.status !== "APPROVED") {
    return res.status(400).json({ success: false, message: "Only approved visitors can be checked in", errors: [] });
  }

  visit.status = "INSIDE";
  visit.checkInTime = new Date(); // server-generated timestamp - client value is never trusted
  await visit.save();

  await logAudit({ actor: req.user._id, action: "CHECK_IN", entityType: "Visit", entityId: visit._id, ip: req.ip });

  res.json({ success: true, message: "Visitor checked in", data: { visit } });
});

export const checkOut = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: "Visit not found", errors: [] });

  if (visit.status !== "INSIDE") {
    return res.status(400).json({ success: false, message: "Visitor has already checked out or was never checked in", errors: [] });
  }

  visit.checkOutTime = new Date(); // server-generated - guarantees checkOutTime >= checkInTime
  visit.status = "COMPLETED";
  visit.activeVisitor = null; // frees up the visitor to register a new active visit
  await visit.save();

  const durationMs = visit.checkOutTime - visit.checkInTime;
  const durationMinutes = Math.round(durationMs / 60000);

  await logAudit({ actor: req.user._id, action: "CHECK_OUT", entityType: "Visit", entityId: visit._id, metadata: { durationMinutes }, ip: req.ip });

  res.json({ success: true, message: "Visitor checked out", data: { visit, durationMinutes } });
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
