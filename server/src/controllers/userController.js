import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  role: z.enum(["admin", "receptionist", "employee"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employee: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "receptionist", "employee"]).optional(),
  employee: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const listUsers = asyncHandler(async (req, res) => {
  const { role, active, q } = req.query;
  const query = {};

  if (role && ["admin", "receptionist", "employee"].includes(role)) {
    query.role = role;
  }

  if (active !== undefined && active !== "") {
    query.active = active === "true";
  }

  const { source } = req.query;
  if (source && ["PUBLIC_REGISTRATION", "ADMIN_CREATED"].includes(source)) {
    query.registrationSource = source;
  }

  let users = await User.find(query)
    .select("-passwordHash")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    })
    .sort({ createdAt: -1 });

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    users = users.filter((u) => {
      const name = (u.name || u.employee?.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || u.employee?.phone || "").toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }

  res.json({ success: true, message: "OK", data: { items: users } });
});

export const createUser = asyncHandler(async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const { name, email, phone, role, password, employee, active } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "A user account with this email already exists",
      errors: [],
    });
  }

  let linkedEmployeeId = null;
  if (role === "employee") {
    if (!employee) {
      return res.status(422).json({
        success: false,
        message: "An employee profile must be selected for the Employee role",
        errors: [],
      });
    }
    const empDoc = await Employee.findById(employee);
    if (!empDoc) {
      return res.status(422).json({
        success: false,
        message: "Selected employee profile does not exist",
        errors: [],
      });
    }
    linkedEmployeeId = empDoc._id;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    name: name ? name.trim() : "",
    email: cleanEmail,
    phone: phone ? phone.trim() : "",
    passwordHash,
    role,
    employee: linkedEmployeeId,
    active: active !== undefined ? active : true,
    registrationSource: "ADMIN_CREATED",
  });

  await logAudit({
    actor: req.user._id,
    action: "USER_CREATED",
    entityType: "User",
    entityId: newUser._id,
    ip: req.ip,
    metadata: { email: cleanEmail, role },
  });

  const created = await User.findById(newUser._id)
    .select("-passwordHash")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: { user: created },
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-passwordHash")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found", errors: [] });
  }

  res.json({ success: true, message: "OK", data: { user } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found", errors: [] });
  }

  const { name, email, phone, role, employee, active } = parsed.data;

  // Safeguards for Admin role / active modifications
  const isTargetAdmin = targetUser.role === "admin" && targetUser.active;
  const isDemotingOrDeactivating =
    (role && role !== "admin") || (active !== undefined && !active);

  if (isTargetAdmin && isDemotingOrDeactivating) {
    const activeAdminCount = await User.countDocuments({ role: "admin", active: true });
    if (activeAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate or demote the last active administrator.",
        errors: [],
      });
    }

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate or demote your own active administrator account.",
        errors: [],
      });
    }
  }

  if (email && email.toLowerCase().trim() !== targetUser.email) {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Another user account with this email already exists",
        errors: [],
      });
    }
    targetUser.email = cleanEmail;
  }

  if (name !== undefined) targetUser.name = name.trim();
  if (phone !== undefined) targetUser.phone = phone.trim();

  const effectiveRole = role || targetUser.role;
  if (role) targetUser.role = role;

  if (effectiveRole === "employee") {
    if (employee !== undefined) {
      if (!employee) {
        return res.status(422).json({
          success: false,
          message: "An employee profile must be selected for the Employee role",
          errors: [],
        });
      }
      const empDoc = await Employee.findById(employee);
      if (!empDoc) {
        return res.status(422).json({
          success: false,
          message: "Selected employee profile does not exist",
          errors: [],
        });
      }
      targetUser.employee = empDoc._id;
    }
  } else {
    targetUser.employee = null;
  }

  if (active !== undefined) targetUser.active = active;

  await targetUser.save();

  await logAudit({
    actor: req.user._id,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: targetUser._id,
    ip: req.ip,
    metadata: { email: targetUser.email, role: targetUser.role, active: targetUser.active },
  });

  const updated = await User.findById(targetUser._id)
    .select("-passwordHash")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    });

  res.json({
    success: true,
    message: "User updated successfully",
    data: { user: updated },
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { active } = req.body;
  if (typeof active !== "boolean") {
    return res.status(422).json({
      success: false,
      message: "Status 'active' must be a boolean value",
      errors: [],
    });
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found", errors: [] });
  }

  if (targetUser.role === "admin" && targetUser.active && !active) {
    const activeAdminCount = await User.countDocuments({ role: "admin", active: true });
    if (activeAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate the last active administrator.",
        errors: [],
      });
    }

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own active administrator account.",
        errors: [],
      });
    }
  }

  targetUser.active = active;
  await targetUser.save();

  const action = active ? "USER_ACTIVATED" : "USER_DEACTIVATED";
  await logAudit({
    actor: req.user._id,
    action,
    entityType: "User",
    entityId: targetUser._id,
    ip: req.ip,
    metadata: { email: targetUser.email, role: targetUser.role },
  });

  const updated = await User.findById(targetUser._id)
    .select("-passwordHash")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    });

  res.json({
    success: true,
    message: `User ${active ? "activated" : "deactivated"} successfully`,
    data: { user: updated },
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found", errors: [] });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  targetUser.passwordHash = passwordHash;
  await targetUser.save();

  await logAudit({
    actor: req.user._id,
    action: "USER_PASSWORD_RESET",
    entityType: "User",
    entityId: targetUser._id,
    ip: req.ip,
    metadata: { email: targetUser.email },
  });

  res.json({
    success: true,
    message: "Password reset successfully",
    data: {},
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found", errors: [] });
  }

  if (targetUser.role === "admin" && targetUser.active) {
    const activeAdminCount = await User.countDocuments({ role: "admin", active: true });
    if (activeAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete the last active administrator.",
        errors: [],
      });
    }

    if (req.user._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own active administrator account.",
        errors: [],
      });
    }
  }

  targetUser.active = false;
  await targetUser.save();

  await logAudit({
    actor: req.user._id,
    action: "USER_DELETED",
    entityType: "User",
    entityId: targetUser._id,
    ip: req.ip,
    metadata: { email: targetUser.email, role: targetUser.role },
  });

  res.json({
    success: true,
    message: "User deactivated successfully",
    data: {},
  });
});
