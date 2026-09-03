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
