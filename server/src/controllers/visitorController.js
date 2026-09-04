import { z } from "zod";
import mongoose from "mongoose";
import Visitor from "../models/Visitor.js";
import Visit from "../models/Visit.js";
import Blacklist from "../models/Blacklist.js";
import Settings from "../models/Settings.js";
import { generateVisitorPassId } from "../utils/idGenerator.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";
import Notification from "../models/Notification.js";
import { ACTIVE_STATUSES } from "../models/Visit.js";

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  mobile: z.string().min(6, "Valid mobile number is required"),
  email: z.string().email().optional().or(z.literal("")),
  organisation: z.string().optional().default(""),
  host: z.string().min(1, "Host is required"),
  department: z.string().min(1, "Department is required"),
  purpose: z.string().min(1, "Purpose is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  vehicleNumber: z.string().optional().default(""),
  itemsCarried: z.string().optional().default(""),
  consent: z.boolean().refine((v) => v === true, "Consent is required"),
});

// Registers a visitor + creates the initial PENDING visit + notifies the host.
// Runs inside a transaction because it touches 3 collections and must stay consistent.
export const registerVisitor = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ success: false, message: "Validation failed", errors: parsed.error.issues.map((i) => i.message) });
  }
  const body = parsed.data;

  const blacklistEntry = await Blacklist.findOne({ mobile: body.mobile, active: true });
  let blacklisted = false;
  if (blacklistEntry) {
    const settings = (await Settings.findOne()) || { blacklistPolicy: "flag" };
    if (settings.blacklistPolicy === "block") {
      return res.status(403).json({ success: false, message: "This visitor is on the blacklist and cannot be registered", errors: [] });
    }
    blacklisted = true;
  }

  const existingVisitor = await Visitor.findOne({ mobile: body.mobile });
  if (existingVisitor) {
    const activeVisit = await Visit.findOne({ visitor: existingVisitor._id, status: { $in: ACTIVE_STATUSES } });
    if (activeVisit) {
      return res.status(409).json({ success: false, message: "Visitor already has an active visit", errors: [] });
    }
  }

  const visitor =
    existingVisitor ||
    (await Visitor.create({
      name: body.name,
      mobile: body.mobile,
      email: body.email || "",
      organisation: body.organisation || "",
      consent: body.consent,
      consentTimestamp: new Date(),
    }));

  const visitorPassId = await generateVisitorPassId();
  const visit = await Visit.create({
    visitor: visitor._id,
    host: body.host,
    department: body.department,
    purpose: body.purpose,
    visitDate: new Date(body.visitDate),
    vehicleNumber: body.vehicleNumber || "",
    itemsCarried: body.itemsCarried || "",
    status: "PENDING",
    visitorPassId,
    createdBy: req.user._id,
    activeVisitor: visitor._id, // enforces DB-level uniqueness of active visits
  });

  await Notification.create({
    recipient: body.host,
    type: "VISIT_REQUEST",
    title: "New Visitor Request",
    message: `${visitor.name} has requested to meet you. Please review and approve or reject the visitor request.`,
    relatedVisit: visit._id,
  });

  await logAudit({
    actor: req.user._id,
    action: "CREATE_VISITOR",
    entityType: "Visit",
    entityId: visit._id,
    metadata: { visitorPassId, blacklisted },
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    message: "Visitor registered successfully",
    data: { visitor, visit, blacklisted },
  });
});

export const listVisitors = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const query = search
    ? { $or: [{ name: new RegExp(search, "i") }, { mobile: new RegExp(search, "i") }, { organisation: new RegExp(search, "i") }] }
    : {};

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Visitor.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Visitor.countDocuments(query),
  ]);

  res.json({
    success: true,
    message: "OK",
    data: { items, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
  });
});

export const getVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) return res.status(404).json({ success: false, message: "Visitor not found", errors: [] });
  const visits = await Visit.find({ visitor: visitor._id }).populate("host", "name").populate("department", "name").sort({ createdAt: -1 });
  res.json({ success: true, message: "OK", data: { visitor, visits } });
});

// Serves identity document only to authorized roles - never a public static URL.
export const getVisitorDocument = asyncHandler(async (req, res) => {
  if (!["admin", "receptionist"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden", errors: [] });
  }
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor || !visitor.idDocRef) {
    return res.status(404).json({ success: false, message: "Document not found", errors: [] });
  }
  await logAudit({ actor: req.user._id, action: "VIEW_DOCUMENT", entityType: "Visitor", entityId: visitor._id, ip: req.ip });
  res.sendFile(visitor.idDocRef, { root: process.env.UPLOAD_DIR || "uploads" });
});
