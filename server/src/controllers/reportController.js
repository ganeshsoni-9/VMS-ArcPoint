import { Parser } from "json2csv";
import Visit from "../models/Visit.js";
import User from "../models/User.js";
import RegistrationRequest from "../models/RegistrationRequest.js";
import AuditLog from "../models/AuditLog.js";
import { asyncHandler } from "../middleware/error.js";


// ============================================================
// DATE HELPERS
// ============================================================

function startOfDay(date) {
  const x = new Date(date);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(date) {
  const x = new Date(date);
  x.setHours(23, 59, 59, 999);
  return x;
}


// ============================================================
// DASHBOARD
// ============================================================

export const dashboard = asyncHandler(async (req, res) => {
  const today = new Date();

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);


  // ============================================================
  // MAIN DASHBOARD QUERIES
  // ============================================================

  const [
    visitorsToday,
    currentlyInside,
    completedToday,
    rejectedOrDenied,
    cancelled,
    statusDistribution,
    recentVisits,

    // User metrics
    totalUsers,
    totalAdmins,
    totalReceptionists,
    totalEmployees,
    activeUsers,
    inactiveUsers,
    publicRegistrationsCount,
    adminCreatedUsersCount,

    // Registration time metrics
    registrationsToday,
    registrationsThisWeek,
    registrationsThisMonth,

    // Registration requests
    totalRegistrationRequests,
    pendingRegistrations,
    approvedRegistrations,
    rejectedRegistrations,

    // Recent registration/activity
    recentRegistrations,
    recentUserActivity,
  ] = await Promise.all([

    // ============================================================
    // VISITOR STATS
    // ============================================================

    // IMPORTANT:
    // Count visitors/visits REGISTERED TODAY.
    //
    // Previously this was using visitDate.
    // Now it uses createdAt so that when receptionist registers
    // Devendra Soni today, "Visitors Today" becomes 1.
    //
    Visit.countDocuments({
      $or: [
        { visitDate: { $gte: todayStart, $lte: todayEnd } },
        { createdAt: { $gte: todayStart, $lte: todayEnd } },
      ],
    }),


    // Currently inside office
    Visit.countDocuments({
      status: "INSIDE",
    }),


    // Completed visits today
    Visit.countDocuments({
      status: "COMPLETED",
      checkOutTime: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),


    // Rejected / Denied visits today
    Visit.countDocuments({
      status: {
        $in: ["REJECTED", "DENIED"],
      },
      updatedAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),


    // Cancelled visits
    Visit.countDocuments({
      status: "CANCELLED",
    }),


    // All visit statuses
    Visit.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),


    // Recent visits
    Visit.find()
      .populate("visitor", "name mobile organisation")
      .populate("host", "name email")
      .populate("department", "name")
      .sort({
        createdAt: -1,
      })
      .limit(8),


    // ============================================================
    // USER METRICS
    // ============================================================

    User.countDocuments({}),

    User.countDocuments({
      role: "admin",
    }),

    User.countDocuments({
      role: "receptionist",
    }),

    User.countDocuments({
      role: "employee",
    }),

    User.countDocuments({
      active: true,
    }),

    User.countDocuments({
      active: false,
    }),

    User.countDocuments({
      registrationSource: "PUBLIC_REGISTRATION",
    }),

    User.countDocuments({
      registrationSource: "ADMIN_CREATED",
    }),


    // ============================================================
    // USER REGISTRATION TIME METRICS
    // ============================================================

    User.countDocuments({
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }),

    User.countDocuments({
      createdAt: {
        $gte: sevenDaysAgo,
      },
    }),

    User.countDocuments({
      createdAt: {
        $gte: firstDayOfMonth,
      },
    }),


    // ============================================================
    // REGISTRATION REQUEST METRICS
    // ============================================================

    RegistrationRequest.countDocuments({}),

    RegistrationRequest.countDocuments({
      status: "PENDING",
    }),

    RegistrationRequest.countDocuments({
      status: "APPROVED",
    }),

    RegistrationRequest.countDocuments({
      status: "REJECTED",
    }),


    // Recent registration requests
    RegistrationRequest.find()
      .select("-passwordHash")
      .sort({
        createdAt: -1,
      })
      .limit(5),


    // Recent user activity
    AuditLog.find({
      action: {
        $regex: "^(USER_|REGISTRATION_|LOGIN)",
      },
    })
      .populate("actor", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(6),
  ]);


  // ============================================================
  // AVERAGE VISIT DURATION
  // ============================================================

  const durationAgg = await Visit.aggregate([
    {
      $match: {
        status: "COMPLETED",
        checkInTime: {
          $ne: null,
        },
        checkOutTime: {
          $ne: null,
        },
      },
    },

    {
      $project: {
        durationMinutes: {
          $divide: [
            {
              $subtract: [
                "$checkOutTime",
                "$checkInTime",
              ],
            },
            60000,
          ],
        },
      },
    },

    {
      $group: {
        _id: null,
        avgDuration: {
          $avg: "$durationMinutes",
        },
      },
    },
  ]);


  // ============================================================
  // REPEAT VISITORS
  // ============================================================

  const repeatVisitorsAgg = await Visit.aggregate([
    {
      $group: {
        _id: "$visitor",
        visits: {
          $sum: 1,
        },
      },
    },

    {
      $match: {
        visits: {
          $gt: 1,
        },
      },
    },

    {
      $count: "repeatVisitors",
    },
  ]);


  // ============================================================
  // DEPARTMENT STATISTICS
  // ============================================================

  const departmentStatsAgg = await Visit.aggregate([
    {
      $group: {
        _id: "$department",
        count: {
          $sum: 1,
        },
      },
    },

    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "department",
      },
    },

    {
      $unwind: "$department",
    },

    {
      $project: {
        name: "$department.name",
        count: 1,
        _id: 0,
      },
    },
  ]);


  // ============================================================
  // REGISTRATION TREND - LAST 30 DAYS
  // ============================================================

  const registrationTrendAgg = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: thirtyDaysAgo,
        },
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },

        count: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);


  // ============================================================
  // RESPONSE
  // ============================================================

  res.json({
    success: true,
    message: "OK",

    data: {

      // ========================================================
      // VISITOR STATS
      // ========================================================

      visitorsToday,

      currentlyInside,

      completedToday,

      rejectedOrDenied,

      cancelled,

      averageVisitDurationMinutes: Math.round(
        durationAgg[0]?.avgDuration || 0
      ),

      repeatVisitors:
        repeatVisitorsAgg[0]?.repeatVisitors || 0,

      statusDistribution,

      departmentStats: departmentStatsAgg,

      recentVisits,


      // ========================================================
      // USER ANALYTICS
      // ========================================================

      totalUsers,

      totalAdmins,

      totalReceptionists,

      totalEmployees,

      activeUsers,

      inactiveUsers,

      publicRegistrationsCount,

      adminCreatedUsersCount,


      // ========================================================
      // REGISTRATION ANALYTICS
      // ========================================================

      registrationsToday,

      registrationsThisWeek,

      registrationsThisMonth,

      totalRegistrationRequests,

      pendingRegistrations,

      approvedRegistrations,

      rejectedRegistrations,


      // ========================================================
      // RECHARTS DATA
      // ========================================================

      registrationStatusDistribution: [
        {
          name: "Pending",
          count: pendingRegistrations,
          fill: "#f59e0b",
        },

        {
          name: "Approved",
          count: approvedRegistrations,
          fill: "#10b981",
        },

        {
          name: "Rejected",
          count: rejectedRegistrations,
          fill: "#ef4444",
        },
      ],


      usersByRole: [
        {
          name: "Admin",
          count: totalAdmins,
          fill: "#8b5cf6",
        },

        {
          name: "Receptionist",
          count: totalReceptionists,
          fill: "#14b8a6",
        },

        {
          name: "Employee",
          count: totalEmployees,
          fill: "#3b82f6",
        },
      ],


      registrationSourceDistribution: [
        {
          name: "Public Registration",
          count: publicRegistrationsCount,
          fill: "#06b6d4",
        },

        {
          name: "Admin Created",
          count: adminCreatedUsersCount,
          fill: "#6366f1",
        },
      ],


      registrationTrend: registrationTrendAgg.map(
        (item) => ({
          date: item._id,
          registrations: item.count,
        })
      ),


      recentRegistrations,

      recentUserActivity,
    },
  });
});


// ============================================================
// RANGE REPORT
// ============================================================

export const rangeReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: [
        "from and to dates are required",
      ],
    });
  }

  const query = {
    visitDate: {
      $gte: startOfDay(from),
      $lte: endOfDay(to),
    },
  };


  const [items, total] = await Promise.all([
    Visit.find(query)
      .populate(
        "visitor",
        "name mobile organisation"
      )
      .populate(
        "host",
        "name"
      )
      .populate(
        "department",
        "name"
      )
      .sort({
        visitDate: -1,
      }),

    Visit.countDocuments(query),
  ]);


  res.json({
    success: true,
    message: "OK",

    data: {
      items,
      total,
      from,
      to,
    },
  });
});


// ============================================================
// REPEAT VISITORS
// ============================================================

export const repeatVisitors = asyncHandler(
  async (req, res) => {

    const items = await Visit.aggregate([
      {
        $group: {
          _id: "$visitor",

          totalVisits: {
            $sum: 1,
          },

          lastVisit: {
            $max: "$visitDate",
          },
        },
      },

      {
        $match: {
          totalVisits: {
            $gt: 1,
          },
        },
      },

      {
        $lookup: {
          from: "visitors",
          localField: "_id",
          foreignField: "_id",
          as: "visitor",
        },
      },

      {
        $unwind: "$visitor",
      },

      {
        $project: {
          name: "$visitor.name",
          mobile: "$visitor.mobile",
          totalVisits: 1,
          lastVisit: 1,
          _id: 0,
        },
      },

      {
        $sort: {
          totalVisits: -1,
        },
      },
    ]);


    res.json({
      success: true,
      message: "OK",

      data: {
        items,
      },
    });
  }
);


// ============================================================
// EXPORT CSV
// ============================================================

export const exportCsv = asyncHandler(
  async (req, res) => {

    const {
      status,
      department,
      host,
      from,
      to,
    } = req.query;

    const query = {};


    if (status) {
      query.status = status;
    }


    if (department) {
      query.department = department;
    }


    if (host) {
      query.host = host;
    }


    if (from || to) {

      query.visitDate = {};

      if (from) {
        query.visitDate.$gte = startOfDay(from);
      }

      if (to) {
        query.visitDate.$lte = endOfDay(to);
      }
    }


    const visits = await Visit.find(query)
      .populate(
        "visitor",
        "name mobile organisation"
      )
      .populate(
        "host",
        "name"
      )
      .populate(
        "department",
        "name"
      )
      .sort({
        visitDate: -1,
      })
      .lean();


    const rows = visits.map((v) => ({
      visitorPassId: v.visitorPassId,

      name: v.visitor?.name || "",

      mobile: v.visitor?.mobile || "",

      organisation:
        v.visitor?.organisation || "",

      host: v.host?.name || "",

      department:
        v.department?.name || "",

      purpose: v.purpose || "",

      visitDate: v.visitDate,

      checkInTime: v.checkInTime,

      checkOutTime: v.checkOutTime,

      status: v.status,
    }));


    const parser = new Parser({
      fields: Object.keys(
        rows[0] || {
          visitorPassId: "",
          name: "",
          mobile: "",
          organisation: "",
          host: "",
          department: "",
          purpose: "",
          visitDate: "",
          checkInTime: "",
          checkOutTime: "",
          status: "",
        }
      ),
    });


    const csv = parser.parse(rows);


    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment(
      `visits-export-${Date.now()}.csv`
    );

    res.send(csv);
  }
);