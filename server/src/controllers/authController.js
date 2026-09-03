import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import RegistrationRequest from "../models/RegistrationRequest.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ success: false, message: "Validation failed", errors: parsed.error.issues });
  }
  const { email, password } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    // Check if there is a RegistrationRequest for this email
    const registration = await RegistrationRequest.findOne({ email: cleanEmail }).sort({ createdAt: -1 });

    if (registration) {
      if (registration.status === "PENDING") {
        return res.status(401).json({
          success: false,
          message: "Your registration is pending administrator approval.",
          errors: [],
        });
      }
      if (registration.status === "REJECTED") {
        return res.status(401).json({
          success: false,
          message: `Your registration request has been rejected. ${
            registration.rejectionReason ? `Reason: ${registration.rejectionReason}` : "Please contact the administrator."
          }`,
          errors: [],
        });
      }
    }

    return res.status(401).json({ success: false, message: "Invalid email or password", errors: [] });
  }

  if (!user.active) {
    return res.status(401).json({
      success: false,
      message: "Your user account is inactive. Please contact the administrator.",
      errors: [],
    });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid email or password", errors: [] });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  await logAudit({ actor: user._id, action: "LOGIN", entityType: "User", entityId: user._id, ip: req.ip });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: { id: user._id, email: user.email, role: user.role, employee: user.employee },
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "OK", data: { user: req.user } });
});

export const logout = asyncHandler(async (req, res) => {
  await logAudit({ actor: req.user._id, action: "LOGOUT", entityType: "User", entityId: req.user._id, ip: req.ip });
  res.json({ success: true, message: "Logged out", data: {} });
});
