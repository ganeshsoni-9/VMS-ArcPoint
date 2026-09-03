import mongoose from "mongoose";

const registrationRequestSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: "" },
    requestedRole: {
      type: String,
      enum: ["receptionist", "employee"],
      required: true,
    },
    passwordHash: { type: String, required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    designation: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    registrationSource: {
      type: String,
      enum: ["PUBLIC_REGISTRATION", "ADMIN_CREATED"],
      default: "PUBLIC_REGISTRATION",
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, trim: true, default: "" },
    approvedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("RegistrationRequest", registrationRequestSchema);
