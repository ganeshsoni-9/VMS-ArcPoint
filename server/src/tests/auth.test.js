import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import app from "../app.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import Visit from "../models/Visit.js";
import { generateVisitorPassId } from "../utils/idGenerator.js";

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await User.create({
    email: "admin@vms.demo",
    passwordHash: await bcrypt.hash("Admin@123", 4),
    role: "admin",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Auth", () => {
  test("valid login succeeds", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@vms.demo", password: "Admin@123" });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test("invalid password fails", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@vms.demo", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("unauthorized user cannot access admin API", async () => {
    const res = await request(app).get("/api/audit-logs");
    expect(res.status).toBe(401);
  });
});

describe("Duplicate active visit", () => {
  test("second active visit for same mobile is rejected at model level", async () => {
    const visitor = await Visitor.create({ name: "Test User", mobile: "9000000000", consent: true, consentTimestamp: new Date() });
    await Visit.create({
      visitor: visitor._id,
      host: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
      purpose: "test",
      visitDate: new Date(),
      status: "PENDING",
      visitorPassId: await generateVisitorPassId(),
      createdBy: new mongoose.Types.ObjectId(),
      activeVisitor: visitor._id,
    });

    await expect(
      Visit.create({
        visitor: visitor._id,
        host: new mongoose.Types.ObjectId(),
        department: new mongoose.Types.ObjectId(),
        purpose: "test 2",
        visitDate: new Date(),
        status: "PENDING",
        visitorPassId: await generateVisitorPassId(),
        createdBy: new mongoose.Types.ObjectId(),
        activeVisitor: visitor._id, // same visitor -> violates partial unique index
      })
    ).rejects.toThrow();
  });
});
