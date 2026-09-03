import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Blacklist", blacklistSchema);
