import AuditLog from "../models/AuditLog.js";

export async function logAudit({ actor, action, entityType, entityId, metadata = {}, ip = "" }) {
  try {
    await AuditLog.create({ actor, action, entityType, entityId, metadata, ip });
  } catch (err) {
    // audit logging must never crash the primary request
    console.error("[audit] failed to write log:", err.message);
  }
}
