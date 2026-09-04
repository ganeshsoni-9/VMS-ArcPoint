import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import Visit from "../models/Visit.js";
import Notification from "../models/Notification.js";

let mongod;
let receptionistToken;
let receptionistId;
let hostEmployeeToken;
let hostEmployeeId;
let hostUserId;
let otherEmployeeToken;
let department;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_workflow_secret_999";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  department = await Department.create({ name: "Design & Consultancy" });

  // Create Host Employee
  const hostEmp = await Employee.create({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@vms.test",
    phone: "9876543210",
    department: department._id,
    designation: "Senior Architect",
  });
  hostEmployeeId = hostEmp._id.toString();

  const passwordHash = await bcrypt.hash("Pass12345", 4);
  const hostUser = await User.create({
    name: "Rajesh Kumar",
    email: "rajesh.kumar@vms.test",
    passwordHash,
    role: "employee",
    employee: hostEmp._id,
    active: true,
  });
  hostUserId = hostUser._id.toString();
  hostEmployeeToken = jwt.sign({ sub: hostUserId, role: "employee" }, process.env.JWT_SECRET);

  // Create Other Employee
  const otherEmp = await Employee.create({
    name: "Sana Iyer",
    email: "sana.iyer@vms.test",
    phone: "9876543211",
    department: department._id,
  });
  const otherUser = await User.create({
    name: "Sana Iyer",
    email: "sana.iyer@vms.test",
    passwordHash,
    role: "employee",
    employee: otherEmp._id,
    active: true,
  });
  otherEmployeeToken = jwt.sign({ sub: otherUser._id.toString(), role: "employee" }, process.env.JWT_SECRET);

  // Create Receptionist
  const receptionistUser = await User.create({
    name: "Priya Receptionist",
    email: "reception@vms.test",
    passwordHash,
    role: "receptionist",
    active: true,
  });
  receptionistId = receptionistUser._id.toString();
  receptionistToken = jwt.sign({ sub: receptionistId, role: "receptionist" }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Complete Real-World Visitor Approval & Check-In Workflow", () => {
  let visitId;

  test("Step 1: Receptionist registers a visitor for Host Employee → Status: PENDING", async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const res = await request(app)
      .post("/api/visitors")
      .set("Authorization", `Bearer ${receptionistToken}`)
      .send({
        name: "Devendra Soni",
        mobile: "7891988981",
        email: "devendra@example.com",
        organisation: "Skyline Builders",
        host: hostEmployeeId,
        department: department._id.toString(),
        purpose: "Project Discussion",
        visitDate: todayStr,
        vehicleNumber: "RJ14-AB-1234",
        itemsCarried: "Laptop, Drawings",
        consent: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit.status).toBe("PENDING");
    expect(res.body.data.visit.visitorPassId).toBeDefined();

    visitId = res.body.data.visit._id;

    // Check Notification created for Host Employee
    const notification = await Notification.findOne({ recipient: hostEmployeeId, relatedVisit: visitId });
    expect(notification).not.toBeNull();
    expect(notification.type).toBe("VISIT_REQUEST");
  });

  test("Step 2: Dashboard metrics initial state → Visitors Today: 1, Currently Inside: 0", async () => {
    const res = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.visitorsToday).toBe(1);
    expect(res.body.data.currentlyInside).toBe(0);
    expect(res.body.data.completedToday).toBe(0);
    expect(res.body.data.rejectedOrDenied).toBe(0);
  });

  test("Step 3: Unauthorized Employee CANNOT approve another employee's visitor request", async () => {
    const res = await request(app)
      .patch(`/api/visits/${visitId}/approve`)
      .set("Authorization", `Bearer ${otherEmployeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("not authorized");
  });

  test("Step 4: Selected Host Employee approves visitor request → Status: APPROVED", async () => {
    const res = await request(app)
      .patch(`/api/visits/${visitId}/approve`)
      .set("Authorization", `Bearer ${hostEmployeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit.status).toBe("APPROVED");

    // Approved visitor is NOT inside yet
    const dashRes = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(dashRes.body.data.currentlyInside).toBe(0);
  });

  test("Step 5: Receptionist checks in visitor → Status: INSIDE", async () => {
    const res = await request(app)
      .patch(`/api/visits/${visitId}/check-in`)
      .set("Authorization", `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit.status).toBe("INSIDE");
    expect(res.body.data.visit.checkInTime).toBeDefined();

    // Verify Currently Inside list
    const insideRes = await request(app)
      .get("/api/visits/inside")
      .set("Authorization", `Bearer ${receptionistToken}`);

    expect(insideRes.status).toBe(200);
    expect(insideRes.body.data.items.length).toBe(1);
    expect(insideRes.body.data.items[0]._id).toBe(visitId);

    // Dashboard Currently Inside should increase to 1
    const dashRes = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(dashRes.body.data.currentlyInside).toBe(1);
  });

  test("Step 6: Receptionist checks out visitor → Status: COMPLETED", async () => {
    const res = await request(app)
      .patch(`/api/visits/${visitId}/check-out`)
      .set("Authorization", `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.visit.status).toBe("COMPLETED");

    // Currently Inside list should now be empty
    const insideRes = await request(app)
      .get("/api/visits/inside")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(insideRes.body.data.items.length).toBe(0);

    // Dashboard check: Currently Inside = 0, Completed Today = 1
    const dashRes = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(dashRes.body.data.currentlyInside).toBe(0);
    expect(dashRes.body.data.completedToday).toBe(1);
  });

  test("Step 7: Host Employee rejects second visitor request → Status: REJECTED", async () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const regRes = await request(app)
      .post("/api/visitors")
      .set("Authorization", `Bearer ${receptionistToken}`)
      .send({
        name: "Rahul Malhotra",
        mobile: "9111111111",
        host: hostEmployeeId,
        department: department._id.toString(),
        purpose: "Sales Pitch",
        visitDate: todayStr,
        consent: true,
      });

    const secondVisitId = regRes.body.data.visit._id;

    const rejectRes = await request(app)
      .patch(`/api/visits/${secondVisitId}/reject`)
      .set("Authorization", `Bearer ${hostEmployeeToken}`)
      .send({ reason: "I am unavailable at this time." });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.visit.status).toBe("REJECTED");
    expect(rejectRes.body.data.visit.rejectionReason).toBe("I am unavailable at this time.");

    // Dashboard check: Rejected/Denied should increase to 1
    const dashRes = await request(app)
      .get("/api/reports/dashboard")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(dashRes.body.data.rejectedOrDenied).toBe(1);
  });
});
