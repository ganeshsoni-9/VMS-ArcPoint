import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import blacklistRoutes from "./routes/blacklistRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like curl, mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });

app.use("/api/auth/login", authLimiter);
app.use("/api", writeLimiter);

app.get("/api/health", (req, res) => res.json({ success: true, message: "OK", data: { status: "up" } }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/blacklist", blacklistRoutes);
app.use("/api/settings", settingsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;