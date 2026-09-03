import Visit from "../models/Visit.js";

// Generates a collision-resistant, human-readable pass ID: VMS-<year>-<6-digit sequence>
export async function generateVisitorPassId() {
  const year = new Date().getFullYear();
  const prefix = `VMS-${year}-`;
  const count = await Visit.countDocuments({ visitorPassId: { $regex: `^${prefix}` } });
  const next = String(count + 1).padStart(6, "0");
  const candidate = `${prefix}${next}`;

  // extremely unlikely, but guard against a race producing a duplicate
  const exists = await Visit.exists({ visitorPassId: candidate });
  if (exists) {
    return `${prefix}${Date.now()}`;
  }
  return candidate;
}
