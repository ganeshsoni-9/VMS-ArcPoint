import { Parser } from "json2csv";
import Visit from "../models/Visit.js";
import { asyncHandler } from "../middleware/error.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export const dashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const [
    visitorsToday,
    currentlyInside,
    completedToday,
    rejectedOrDenied,
    cancelled,
    statusDistribution,
    recentVisits,
  ] = await Promise.all([
    Visit.countDocuments({ visitDate: { $gte: startOfDay(today), $lte: endOfDay(today) } }),
    Visit.countDocuments({ status: "INSIDE" }),
    Visit.countDocuments({ status: "COMPLETED", checkOutTime: { $gte: startOfDay(today), $lte: endOfDay(today) } }),
    Visit.countDocuments({ status: { $in: ["REJECTED", "DENIED"] } }),
    Visit.countDocuments({ status: "CANCELLED" }),
    Visit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Visit.find().populate("visitor", "name").populate("host", "name").sort({ createdAt: -1 }).limit(8),
  ]);

  const durationAgg = await Visit.aggregate([
    { $match: { status: "COMPLETED", checkInTime: { $ne: null }, checkOutTime: { $ne: null } } },
    { $project: { durationMinutes: { $divide: [{ $subtract: ["$checkOutTime", "$checkInTime"] }, 60000] } } },
    { $group: { _id: null, avgDuration: { $avg: "$durationMinutes" } } },
  ]);

  const repeatVisitorsAgg = await Visit.aggregate([
    { $group: { _id: "$visitor", visits: { $sum: 1 } } },
    { $match: { visits: { $gt: 1 } } },
    { $count: "repeatVisitors" },
  ]);

  const departmentStatsAgg = await Visit.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "department" } },
    { $unwind: "$department" },
    { $project: { name: "$department.name", count: 1, _id: 0 } },
  ]);

  res.json({
    success: true,
    message: "OK",
    data: {
      visitorsToday,
      currentlyInside,
      completedToday,
      rejectedOrDenied,
      cancelled,
      averageVisitDurationMinutes: Math.round(durationAgg[0]?.avgDuration || 0),
      repeatVisitors: repeatVisitorsAgg[0]?.repeatVisitors || 0,
      statusDistribution,
      departmentStats: departmentStatsAgg,
      recentVisits,
    },
  });
});

export const rangeReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(422).json({ success: false, message: "Validation failed", errors: ["from and to dates are required"] });
  }
  const query = { visitDate: { $gte: startOfDay(from), $lte: endOfDay(to) } };
  const [items, total] = await Promise.all([
    Visit.find(query).populate("visitor", "name mobile organisation").populate("host", "name").populate("department", "name").sort({ visitDate: -1 }),
    Visit.countDocuments(query),
  ]);
  res.json({ success: true, message: "OK", data: { items, total, from, to } });
});

export const repeatVisitors = asyncHandler(async (req, res) => {
  const items = await Visit.aggregate([
    { $group: { _id: "$visitor", totalVisits: { $sum: 1 }, lastVisit: { $max: "$visitDate" } } },
    { $match: { totalVisits: { $gt: 1 } } },
    { $lookup: { from: "visitors", localField: "_id", foreignField: "_id", as: "visitor" } },
    { $unwind: "$visitor" },
    { $project: { name: "$visitor.name", mobile: "$visitor.mobile", totalVisits: 1, lastVisit: 1, _id: 0 } },
    { $sort: { totalVisits: -1 } },
  ]);
  res.json({ success: true, message: "OK", data: { items } });
});

// CSV export respects the same filters as listVisits; never includes idDocRef.
export const exportCsv = asyncHandler(async (req, res) => {
  const { status, department, host, from, to } = req.query;
  const query = {};
  if (status) query.status = status;
  if (department) query.department = department;
  if (host) query.host = host;
  if (from || to) {
    query.visitDate = {};
    if (from) query.visitDate.$gte = new Date(from);
    if (to) query.visitDate.$lte = new Date(to);
  }

  const visits = await Visit.find(query)
    .populate("visitor", "name mobile organisation")
    .populate("host", "name")
    .populate("department", "name")
    .sort({ visitDate: -1 })
    .lean();

  const rows = visits.map((v) => ({
    visitorPassId: v.visitorPassId,
    name: v.visitor?.name,
    mobile: v.visitor?.mobile,
    organisation: v.visitor?.organisation,
    host: v.host?.name,
    department: v.department?.name,
    purpose: v.purpose,
    visitDate: v.visitDate,
    checkInTime: v.checkInTime,
    checkOutTime: v.checkOutTime,
    status: v.status,
  }));

  const parser = new Parser({ fields: Object.keys(rows[0] || { visitorPassId: "" }) });
  const csv = parser.parse(rows);

  res.header("Content-Type", "text/csv");
  res.attachment(`visits-export-${Date.now()}.csv`);
  res.send(csv);
});
