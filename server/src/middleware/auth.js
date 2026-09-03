import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized", errors: [] });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === "TokenExpiredError" ? "Session expired, please log in again" : "Invalid token";
      return res.status(401).json({ success: false, message, errors: [] });
    }

    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: "Unauthorized", errors: [] });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
