import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import RegistrationRequest from "../models/RegistrationRequest.js";
import { generateRegistrationId } from "../utils/idGenerator.js";
import { logAudit } from "../utils/audit.js";
import { asyncHandler } from "../middleware/error.js";

const submitRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  requestedRole: z.enum(["receptionist", "employee"], {
    errorMap: () => ({ message: "Public registration is allowed ONLY for Receptionist or Employee roles" }),
  }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  department: z.string().nullable().optional(),
  designation: z.string().optional(),
});

// PUBLIC: Register & Create Account Immediately
export const submitRegistration = asyncHandler(async (req, res) => {
  // Explicitly guard against malicious admin role attempt
  if (req.body.requestedRole === "admin" || req.body.role === "admin") {
    return res.status(422).json({
      success: false,
      message: "Public registration is not permitted for Administrator role.",
      errors: [],
    });
  }

  const parsed = submitRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const { fullName, email, phone, requestedRole, password, department, designation } =
    parsed.data;

  const cleanEmail = email.toLowerCase().trim();

  // Check duplicate email in User collection
  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists.",
      errors: [],
    });
  }

  let linkedEmployeeId = null;
  if (requestedRole === "employee") {
    let empDoc = await Employee.findOne({ email: cleanEmail });
    if (!empDoc) {
      // Find a fallback department if none supplied
      let deptId = department;
      if (!deptId) {
        const defaultDept = await Department.findOne();
        deptId = defaultDept ? defaultDept._id : null;
      }

      if (!deptId) {
        return res.status(422).json({
          success: false,
          message: "Please select a valid department for Employee registration.",
          errors: [],
        });
      }

      empDoc = await Employee.create({
        name: fullName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : "",
        department: deptId,
        designation: designation ? designation.trim() : "Employee",
        active: true,
      });
    }
    linkedEmployeeId = empDoc._id;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create active User account immediately
  const newUser = await User.create({
    name: fullName.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : "",
    passwordHash,
    role: requestedRole,
    employee: linkedEmployeeId,
    active: true,
    registrationSource: "PUBLIC_REGISTRATION",
  });

  // Track historical registration log
  const registrationId = await generateRegistrationId();
  const regDoc = await RegistrationRequest.create({
    registrationId,
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : "",
    requestedRole,
    passwordHash,
    employee: linkedEmployeeId,
    department: department || null,
    designation: designation ? designation.trim() : "",
    status: "APPROVED",
    registrationSource: "PUBLIC_REGISTRATION",
    submittedAt: new Date(),
    reviewedAt: new Date(),
    approvedUser: newUser._id,
    ipAddress: req.ip || "",
  });

  await logAudit({
    actor: newUser._id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: newUser._id,
    ip: req.ip,
    metadata: {
      registrationId,
      email: cleanEmail,
      role: requestedRole,
      registrationSource: "PUBLIC_REGISTRATION",
    },
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        active: newUser.active,
        registrationSource: newUser.registrationSource,
        registrationId,
        createdAt: newUser.createdAt,
      },
    },
  });
});

// PUBLIC: Get status / details
export const getRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await RegistrationRequest.findOne({
    $or: [{ registrationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  })
    .select("-passwordHash")
    .populate("department", "name");

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration record not found",
      errors: [],
    });
  }

  res.json({
    success: true,
    message: "OK",
    data: { registration },
  });
});

// ADMIN ONLY: List all registration records
export const listRegistrations = asyncHandler(async (req, res) => {
  const { role, status, source, q } = req.query;
  const query = {};

  if (role && ["receptionist", "employee"].includes(role)) {
    query.requestedRole = role;
  }

  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    query.status = status;
  }

  if (source && ["PUBLIC_REGISTRATION", "ADMIN_CREATED"].includes(source)) {
    query.registrationSource = source;
  }

  let items = await RegistrationRequest.find(query)
    .select("-passwordHash")
    .populate("reviewedBy", "name email")
    .populate("employee")
    .populate("department", "name")
    .sort({ createdAt: -1 });

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    items = items.filter((item) => {
      const name = (item.fullName || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const regId = (item.registrationId || "").toLowerCase();
      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        regId.includes(term)
      );
    });
  }

  res.json({
    success: true,
    message: "OK",
    data: { items },
  });
});

// ADMIN ONLY: Get registration details
export const getRegistrationDetails = asyncHandler(async (req, res) => {
  const registration = await RegistrationRequest.findById(req.params.id)
    .select("-passwordHash")
    .populate("reviewedBy", "name email")
    .populate("approvedUser", "name email role")
    .populate({
      path: "employee",
      populate: { path: "department", select: "name" },
    })
    .populate("department", "name");

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration record not found",
      errors: [],
    });
  }

  res.json({
    success: true,
    message: "OK",
    data: { registration },
  });
});

// ADMIN ONLY: Approve registration request (for legacy pending records)
export const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await RegistrationRequest.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration request not found",
      errors: [],
    });
  }

  if (registration.status !== "PENDING") {
    return res.status(422).json({
      success: false,
      message: `Registration request is already ${registration.status.toLowerCase()}`,
      errors: [],
    });
  }

  const existingUser = await User.findOne({ email: registration.email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An active user account with this email already exists.",
      errors: [],
    });
  }

  let linkedEmployeeId = registration.employee || null;
  if (registration.requestedRole === "employee" && !linkedEmployeeId) {
    const empDoc = await Employee.findOne({ email: registration.email });
    if (empDoc) {
      linkedEmployeeId = empDoc._id;
    }
  }

  const newUser = await User.create({
    name: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    passwordHash: registration.passwordHash,
    role: registration.requestedRole,
    employee: linkedEmployeeId,
    active: true,
    registrationSource: registration.registrationSource,
  });

  registration.status = "APPROVED";
  registration.reviewedBy = req.user._id;
  registration.reviewedAt = new Date();
  registration.approvedUser = newUser._id;
  await registration.save();

  await logAudit({
    actor: req.user._id,
    action: "REGISTRATION_APPROVED",
    entityType: "RegistrationRequest",
    entityId: registration._id,
    ip: req.ip,
    metadata: {
      registrationId: registration.registrationId,
      email: registration.email,
      approvedUserId: newUser._id,
      role: newUser.role,
    },
  });

  res.json({
    success: true,
    message: "Registration request approved successfully. User account created.",
    data: { registration, user: newUser },
  });
});

// ADMIN ONLY: Reject registration request (for legacy pending records)
export const rejectRegistration = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const registration = await RegistrationRequest.findById(req.params.id);
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration request not found",
      errors: [],
    });
  }

  if (registration.status !== "PENDING") {
    return res.status(422).json({
      success: false,
      message: `Registration request is already ${registration.status.toLowerCase()}`,
      errors: [],
    });
  }

  registration.status = "REJECTED";
  registration.rejectionReason = rejectionReason ? rejectionReason.trim() : "Rejected by administrator";
  registration.reviewedBy = req.user._id;
  registration.reviewedAt = new Date();
  await registration.save();

  await logAudit({
    actor: req.user._id,
    action: "REGISTRATION_REJECTED",
    entityType: "RegistrationRequest",
    entityId: registration._id,
    ip: req.ip,
    metadata: {
      registrationId: registration.registrationId,
      email: registration.email,
      rejectionReason: registration.rejectionReason,
    },
  });

  res.json({
    success: true,
    message: "Registration request rejected successfully",
    data: { registration },
  });
});
