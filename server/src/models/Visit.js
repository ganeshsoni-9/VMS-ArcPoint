import mongoose from "mongoose";

export const VISIT_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "INSIDE",
  "COMPLETED",
  "CANCELLED",
  "DENIED",
];

// Active statuses used for the "duplicate active visit" business rule
export const ACTIVE_STATUSES = ["PENDING", "APPROVED", "INSIDE"];

const visitSchema = new mongoose.Schema(
  {
    visitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    purpose: { type: String, required: true },
    visitDate: { type: Date, required: true },
    vehicleNumber: { type: String, default: "" },
    itemsCarried: { type: String, default: "" },
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    status: { type: String, enum: VISIT_STATUSES, default: "PENDING" },
    visitorPassId: { type: String, required: true, unique: true },
    hostResponse: { type: String, enum: ["APPROVED", "REJECTED", null], default: null },
    hostResponseTime: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    denialReason: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // denormalized flag to enforce "only one active visit per visitor" via a partial unique index
    activeVisitor: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", default: null },
  },
  { timestamps: true }
);

visitSchema.index({ visitDate: 1 });
visitSchema.index({ status: 1 });
visitSchema.index({ host: 1 });
visitSchema.index({ department: 1 });
// Enforces "same visitor cannot have multiple active visits" at the DB level (race-condition safe)
visitSchema.index(
  { activeVisitor: 1 },
  { unique: true, partialFilterExpression: { activeVisitor: { $type: "objectId" } } }
);

export default mongoose.model("Visit", visitSchema);
