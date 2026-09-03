import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

let mongod;
let adminToken;
let receptionistToken;
let employeeToken;
let adminId;
let receptionistId;
let employeeUserId;
let testEmployeeDoc;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_key_12345";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const dept = await Department.create({ name: "Architecture" });
  testEmployeeDoc = await Employee.create({
    name: "John Architect",
    email: "john.architect@vms.test",
    phone: "9998887770",
    department: dept._id,
    designation: "Senior Architect",
  });

  const adminHash = await bcrypt.hash("AdminPass123", 4);
  const adminUser = await User.create({
    name: "System Admin",
    email: "admin@vms.test",
    passwordHash: adminHash,
    role: "admin",
    active: true,
  });
  adminId = adminUser._id.toString();

  const receptionistHash = await bcrypt.hash("RecepPass123", 4);
  const recepUser = await User.create({
    name: "Front Reception",
    email: "reception@vms.test",
    passwordHash: receptionistHash,
    role: "receptionist",
    active: true,
  });
  receptionistId = recepUser._id.toString();

  const employeeHash = await bcrypt.hash("EmpPass123", 4);
  const empUser = await User.create({
    email: "employee@vms.test",
    passwordHash: employeeHash,
    role: "employee",
    employee: testEmployeeDoc._id,
    active: true,
  });
  employeeUserId = empUser._id.toString();

  adminToken = jwt.sign({ sub: adminId, role: "admin" }, process.env.JWT_SECRET);
  receptionistToken = jwt.sign({ sub: receptionistId, role: "receptionist" }, process.env.JWT_SECRET);
  employeeToken = jwt.sign({ sub: employeeUserId, role: "employee" }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("User Management API - Access Control & Authentication", () => {
  test("Unauthenticated request to GET /api/users returns 401", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  test("Receptionist request to GET /api/users returns 403 Forbidden", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${receptionistToken}`);
    expect(res.status).toBe(403);
  });

  test("Employee request to POST /api/users returns 403 Forbidden", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        email: "hacker@vms.test",
        password: "Password123",
        role: "admin",
      });
    expect(res.status).toBe(403);
  });

  test("Admin request to GET /api/users returns 200 OK with users list", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(3);
  });
});

describe("User Creation & Validation", () => {
  test("Admin creates Receptionist account successfully", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Second Receptionist",
        email: "reception2@vms.test",
        phone: "9123456789",
        password: "NewPassword123",
        role: "receptionist",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("reception2@vms.test");
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test("Admin creates Employee account linked to Employee document", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "emp2@vms.test",
        password: "NewPassword123",
        role: "employee",
        employee: testEmployeeDoc._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.employee._id).toBe(testEmployeeDoc._id.toString());
  });

  test("Creating employee account without employee ID returns 422", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "unlinkedemp@vms.test",
        password: "NewPassword123",
        role: "employee",
      });

    expect(res.status).toBe(422);
  });

  test("Creating user with existing email returns 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Duplicate Email User",
        email: "admin@vms.test",
        password: "NewPassword123",
        role: "receptionist",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("already exists");
  });
});

describe("User Status, Password Reset & Protection Rules", () => {
  let createdUserId;

  beforeAll(async () => {
    const u = await User.create({
      name: "Temporary User",
      email: "temp@vms.test",
      passwordHash: "hash123",
      role: "receptionist",
      active: true,
    });
    createdUserId = u._id.toString();
  });

  test("Admin resets user password securely", async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/password`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ password: "UpdatedPassword123" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updatedUser = await User.findById(createdUserId);
    const isMatch = await bcrypt.compare("UpdatedPassword123", updatedUser.passwordHash);
    expect(isMatch).toBe(true);
  });

  test("Admin deactivates user account", async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ active: false });

    expect(res.status).toBe(200);
    expect(res.body.data.user.active).toBe(false);
  });

  test("Attempt to deactivate sole active admin is rejected with 400", async () => {
    const res = await request(app)
      .patch(`/api/users/${adminId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ active: false });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("last active administrator");
  });
});
