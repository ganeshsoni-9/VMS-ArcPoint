import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import Employee from "./models/Employee.js";
import Department from "./models/Department.js";
import Visitor from "./models/Visitor.js";
import Visit from "./models/Visit.js";
import Settings from "./models/Settings.js";
import { generateVisitorPassId } from "./utils/idGenerator.js";

async function seed() {
  await connectDB();
  console.log("[seed] clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Visitor.deleteMany({}),
    Visit.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  const departments = await Department.insertMany([
    { name: "Architecture" },
    { name: "Interior Design" },
    { name: "Structural Design" },
    { name: "Project Management" },
    { name: "Administration" },
    { name: "Finance" },
  ]);
  const byName = Object.fromEntries(departments.map((d) => [d.name, d._id]));

  const employeeSeed = [
    { name: "Aarav Mehta", email: "aarav.mehta@example.com", phone: "9800000001", department: byName["Architecture"], designation: "Principal Architect" },
    { name: "Riya Sharma", email: "riya.sharma@example.com", phone: "9800000002", department: byName["Interior Design"], designation: "Lead Designer" },
    { name: "Kabir Verma", email: "kabir.verma@example.com", phone: "9800000003", department: byName["Structural Design"], designation: "Structural Engineer" },
    { name: "Ananya Kapoor", email: "ananya.kapoor@example.com", phone: "9800000004", department: byName["Project Management"], designation: "Project Manager" },
    { name: "Vihaan Gupta", email: "vihaan.gupta@example.com", phone: "9800000005", department: byName["Administration"], designation: "Office Admin" },
  ];
  const employees = await Employee.insertMany(employeeSeed);

  const adminHash = await bcrypt.hash("Admin@123", 12);
  const receptionHash = await bcrypt.hash("Reception@123", 12);
  const employeeHash = await bcrypt.hash("Employee@123", 12);

  const adminUser = await User.create({ email: "admin@vms.demo", passwordHash: adminHash, role: "admin" });
  const receptionUser = await User.create({ email: "reception@vms.demo", passwordHash: receptionHash, role: "receptionist" });
  const employeeUser = await User.create({
    email: "employee@vms.demo",
    passwordHash: employeeHash,
    role: "employee",
    employee: employees[0]._id, // Aarav Mehta logs in as this demo employee
  });

  await Settings.create({ retentionDays: 365, blacklistPolicy: "flag" });

  // Sample visitors/visits demonstrating various states
  const sampleVisitors = [
    { name: "Rahul Sharma", mobile: "9111111111", organisation: "Skyline Builders" },
    { name: "Priya Nair", mobile: "9222222222", organisation: "GreenScape Interiors" },
    { name: "Karan Malhotra", mobile: "9333333333", organisation: "Malhotra & Sons" },
  ];

  for (const v of sampleVisitors) {
    const visitor = await Visitor.create({ ...v, consent: true, consentTimestamp: new Date() });
    const visitorPassId = await generateVisitorPassId();
    await Visit.create({
      visitor: visitor._id,
      host: employees[Math.floor(Math.random() * employees.length)]._id,
      department: departments[Math.floor(Math.random() * departments.length)]._id,
      purpose: "Project discussion",
      visitDate: new Date(),
      status: "COMPLETED",
      visitorPassId,
      checkInTime: new Date(Date.now() - 3600_000),
      checkOutTime: new Date(),
      createdBy: receptionUser._id,
    });
  }

  // A repeat visitor with 2 completed visits
  const repeatVisitor = await Visitor.create({ name: "Rahul Sharma", mobile: "9111111111", organisation: "Skyline Builders", consent: true, consentTimestamp: new Date() });
  await Visit.create({
    visitor: repeatVisitor._id,
    host: employees[0]._id,
    department: departments[0]._id,
    purpose: "Follow-up meeting",
    visitDate: new Date(Date.now() - 86400_000 * 3),
    status: "COMPLETED",
    visitorPassId: await generateVisitorPassId(),
    checkInTime: new Date(Date.now() - 86400_000 * 3),
    checkOutTime: new Date(Date.now() - 86400_000 * 3 + 3600_000),
    createdBy: receptionUser._id,
  });

  // One currently-pending visit awaiting host approval
  const pendingVisitor = await Visitor.create({ name: "Sana Iyer", mobile: "9444444444", organisation: "Iyer Estates", consent: true, consentTimestamp: new Date() });
  await Visit.create({
    visitor: pendingVisitor._id,
    host: employees[0]._id,
    department: byName["Architecture"],
    purpose: "New project pitch",
    visitDate: new Date(),
    status: "PENDING",
    visitorPassId: await generateVisitorPassId(),
    createdBy: receptionUser._id,
    activeVisitor: pendingVisitor._id,
  });

  console.log("[seed] done. Demo users:");
  console.log("  admin@vms.demo / Admin@123");
  console.log("  reception@vms.demo / Reception@123");
  console.log("  employee@vms.demo / Employee@123 (linked to Aarav Mehta)");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
