import mongoose from "mongoose";

// Singleton document (there is only ever one Settings row)
const settingsSchema = new mongoose.Schema(
  {
    retentionDays: { type: Number, default: 365 },
    blacklistPolicy: { type: String, enum: ["block", "flag"], default: "flag" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
