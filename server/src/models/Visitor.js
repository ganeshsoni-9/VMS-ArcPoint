import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    organisation: { type: String, default: "" },
    photoRef: { type: String, default: null },
    idDocRef: { type: String, default: null },
    consent: { type: Boolean, required: true },
    consentTimestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

visitorSchema.index({ name: "text", organisation: "text" });

export default mongoose.model("Visitor", visitorSchema);