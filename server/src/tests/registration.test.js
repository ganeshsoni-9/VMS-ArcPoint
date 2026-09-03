import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../app.js";
import User from "../models/User.js";
import Department from "../models/Department.js";

let mongod;
let adminToken;
let adminId;
let testDept;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_registration_secret_123";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  testDept = await Department.create({ name: "Architecture & Design" });

  const adminHash = await bcrypt.hash("AdminPass123", 4);
  const adminUser = await User.create({
    name: "System Administrator",
    email: "admin@vms.test",
    passwordHash: adminHash,
    role: "admin",
    active: true,
  });
  adminId = adminUser._id.toString();
  adminToken = jwt.sign({ sub: adminId, role: "admin" }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Public User Registration API - Immediate Signup System", () => {
  test("Public user can submit valid registration for Receptionist role and log in immediately", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send({
        fullName: "Sarah Connor",
        email: "sarah.connor@vms.test",
        phone: "9876543210",
        requestedRole: "receptionist",
        password: "Password123",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("sarah.connor@vms.test");
    expect(res.body.data.user.role).toBe("receptionist");
    expect(res.body.data.user.active).toBe(true);
    expect(res.body.data.user.registrationSource).toBe("PUBLIC_REGISTRATION");

    // Immediate Login Check
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "sarah.connor@vms.test", password: "Password123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
    expect(loginRes.body.data.user.role).toBe("receptionist");
  });

  test("Public user can submit valid registration for Employee role and log in immediately", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send({
        fullName: "Arthur Architect",
        email: "arthur@vms.test",
        phone: "9988776655",
        requestedRole: "employee",
        password: "Password123",
        department: testDept._id.toString(),
        designation: "Senior Architect",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("arthur@vms.test");
    expect(res.body.data.user.role).toBe("employee");

    // Login Check
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "arthur@vms.test", password: "Password123" });

    expect(loginRes.status).toBe(200);
  });

  test("Public user CANNOT request Admin role via public registration", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send({
        fullName: "Malicious Hacker",
        email: "hacker@vms.test",
        requestedRole: "admin",
        password: "Password123",
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain("not permitted for Administrator role");
  });

  test("Duplicate email registration returns 409 Conflict", async () => {
    const res = await request(app)
      .post("/api/registrations")
      .send({
        fullName: "Sarah Connor Duplicate",
        email: "sarah.connor@vms.test",
        requestedRole: "receptionist",
        password: "Password123",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("already exists");
  });

  test("Public department route returns 200 without token", async () => {
    const res = await request(app).get("/api/departments/public");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
