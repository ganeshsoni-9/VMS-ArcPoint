import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "receptionist", "employee"], required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    registrationSource: {
      type: String,
      enum: ["PUBLIC_REGISTRATION", "ADMIN_CREATED"],
      default: "ADMIN_CREATED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
