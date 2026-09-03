// This seed script is NON-DESTRUCTIVE and never deletes existing database data.
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
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("\n[seed] NON-DESTRUCTIVE SEED: Preserving existing database records...\n");

  // 1. Seed Departments safely (Unique identifier: name)
  const departmentNames = [
    "Architecture",
    "Interior Design",
    "Structural Design",
    "Project Management",
    "Administration",
    "Finance",
  ];
  const byName = {};

  for (const deptName of departmentNames) {
    let dept = await Department.findOne({ name: deptName });
    if (!dept) {
      dept = await Department.create({ name: deptName });
      console.log(`✓ ${deptName} department created`);
    } else {
      console.log(`✓ ${deptName} department already exists`);
    }
    byName[deptName] = dept._id;
  }

  // 2. Seed Employees safely (Unique identifier: email)
  const employeeDefs = [
    { name: "Aarav Mehta", email: "aarav.mehta@example.com", phone: "9800000001", departmentName: "Architecture", designation: "Principal Architect" },
    { name: "Riya Sharma", email: "riya.sharma@example.com", phone: "9800000002", departmentName: "Interior Design", designation: "Lead Designer" },
    { name: "Kabir Verma", email: "kabir.verma@example.com", phone: "9800000003", departmentName: "Structural Design", designation: "Structural Engineer" },
    { name: "Ananya Kapoor", email: "ananya.kapoor@example.com", phone: "9800000004", departmentName: "Project Management", designation: "Project Manager" },
    { name: "Vihaan Gupta", email: "vihaan.gupta@example.com", phone: "9800000005", departmentName: "Administration", designation: "Office Admin" },
  ];

  const employees = [];
  let aaravMehtaEmp = null;

  for (const empDef of employeeDefs) {
    let emp = await Employee.findOne({ email: empDef.email });
    if (!emp) {
      emp = await Employee.create({
        name: empDef.name,
        email: empDef.email,
        phone: empDef.phone,
        department: byName[empDef.departmentName],
        designation: empDef.designation,
      });
      console.log(`✓ ${empDef.name} employee created`);
    } else {
      console.log(`✓ ${empDef.name} employee already exists`);
    }
    employees.push(emp);
    if (empDef.email === "aarav.mehta@example.com") {
      aaravMehtaEmp = emp;
    }
  }

  // 3. Seed Users safely (Unique identifier: email)
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const receptionHash = await bcrypt.hash("Reception@123", 12);
  const employeeHash = await bcrypt.hash("Employee@123", 12);

  let adminUser = await User.findOne({ email: "admin@vms.demo" });
  if (!adminUser) {
    adminUser = await User.create({ email: "admin@vms.demo", passwordHash: adminHash, role: "admin" });
    console.log("✓ Admin user created");
  } else {
    console.log("✓ Admin user already exists");
  }

  let receptionUser = await User.findOne({ email: "reception@vms.demo" });
  if (!receptionUser) {
    receptionUser = await User.create({ email: "reception@vms.demo", passwordHash: receptionHash, role: "receptionist" });
    console.log("✓ Receptionist user created");
  } else {
    console.log("✓ Receptionist user already exists");
  }

  let employeeUser = await User.findOne({ email: "employee@vms.demo" });
  if (!employeeUser) {
    employeeUser = await User.create({
      email: "employee@vms.demo",
      passwordHash: employeeHash,
      role: "employee",
      employee: aaravMehtaEmp ? aaravMehtaEmp._id : null,
    });
    console.log("✓ Employee user created");
  } else {
    console.log("✓ Employee user already exists");
  }

  // 4. Seed Settings safely (Singleton)
  let settings = await Settings.findOne();
  if (!settings) {
    await Settings.create({ retentionDays: 365, blacklistPolicy: "flag" });
    console.log("✓ System settings created");
  } else {
    console.log("✓ System settings already exist");
  }

  // 5. Seed Sample Visitors and Visits safely
  const sampleVisitorDefs = [
    { name: "Rahul Sharma", mobile: "9111111111", organisation: "Skyline Builders" },
    { name: "Priya Nair", mobile: "9222222222", organisation: "GreenScape Interiors" },
    { name: "Karan Malhotra", mobile: "9333333333", organisation: "Malhotra & Sons" },
  ];

  for (let i = 0; i < sampleVisitorDefs.length; i++) {
    const vDef = sampleVisitorDefs[i];
    let visitor = await Visitor.findOne({ mobile: vDef.mobile, name: vDef.name });
    if (!visitor) {
      visitor = await Visitor.create({ ...vDef, consent: true, consentTimestamp: new Date() });
      const visitorPassId = await generateVisitorPassId();
      await Visit.create({
        visitor: visitor._id,
        host: employees[i % employees.length]._id,
        department: byName[Object.keys(byName)[i % Object.keys(byName).length]],
        purpose: "Project discussion",
        visitDate: new Date(),
        status: "COMPLETED",
        visitorPassId,
        checkInTime: new Date(Date.now() - 3600_000),
        checkOutTime: new Date(),
        createdBy: receptionUser._id,
      });
      console.log(`✓ Sample visitor ${vDef.name} created`);
    } else {
      console.log(`✓ Sample visitor ${vDef.name} already exists`);
    }
  }

  // Repeat Visitor check
  let repeatVisitor = await Visitor.findOne({ mobile: "9111111111", organisation: "Skyline Builders" });
  if (repeatVisitor) {
    const existingFollowup = await Visit.findOne({ visitor: repeatVisitor._id, purpose: "Follow-up meeting" });
    if (!existingFollowup) {
      await Visit.create({
        visitor: repeatVisitor._id,
        host: employees[0]._id,
        department: byName["Architecture"],
        purpose: "Follow-up meeting",
        visitDate: new Date(Date.now() - 86400_000 * 3),
        status: "COMPLETED",
        visitorPassId: await generateVisitorPassId(),
        checkInTime: new Date(Date.now() - 86400_000 * 3),
        checkOutTime: new Date(Date.now() - 86400_000 * 3 + 3600_000),
        createdBy: receptionUser._id,
      });
      console.log("✓ Repeat visit for Rahul Sharma created");
    } else {
      console.log("✓ Repeat visit for Rahul Sharma already exists");
    }
  }

  // Pending Visitor check
  let pendingVisitor = await Visitor.findOne({ mobile: "9444444444", name: "Sana Iyer" });
  if (!pendingVisitor) {
    pendingVisitor = await Visitor.create({ name: "Sana Iyer", mobile: "9444444444", organisation: "Iyer Estates", consent: true, consentTimestamp: new Date() });
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
    console.log("✓ Pending demo visitor Sana Iyer created");
  } else {
    console.log("✓ Pending demo visitor Sana Iyer already exists");
  }

  console.log("\nSeed completed successfully.");
  console.log("\nIMPORTANT:");
  console.log("Existing database data was preserved.");
  console.log("No existing records were deleted.\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message || err);
  process.exit(1);
});
