import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import {
  Users,
  DoorOpen,
  CheckCircle2,
  XCircle,
  Timer,
  Repeat,
  Clock,
  UserCheck,
  UserX,
  Shield,
  FileText,
  Activity,
  ArrowRight,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then((res) => {
        setData(res.data.data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics for visitors, user registration requests, and office access.
          </p>
        </div>
      </div>

      {state === "loading" && <LoadingSpinner label="Loading dashboard analytics..." />}
      {state === "error" && <ErrorState message="Unable to load dashboard. Try again." />}

      {state === "success" && data && (
        <div className="space-y-6">
          {/* SECTION 1: VISITOR OVERVIEW */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Visitor Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <DashboardCard label="Visitors Today" value={data.visitorsToday} icon={Users} />
              <DashboardCard label="Currently Inside" value={data.currentlyInside} icon={DoorOpen} />
              <DashboardCard label="Completed Today" value={data.completedToday} icon={CheckCircle2} />
              <DashboardCard label="Rejected/Denied" value={data.rejectedOrDenied} icon={XCircle} />
              <DashboardCard label="Avg. Duration (min)" value={data.averageVisitDurationMinutes} icon={Timer} />
              <DashboardCard label="Repeat Visitors" value={data.repeatVisitors} icon={Repeat} />
            </div>
          </div>

          {/* SECTION 2: USER & REGISTRATION OVERVIEW */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              User & Registration Analytics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <DashboardCard label="Total Users" value={data.totalUsers} icon={Users} />
              <DashboardCard label="Active Accounts" value={data.activeUsers} icon={UserCheck} />
              <DashboardCard label="Inactive Accounts" value={data.inactiveUsers} icon={UserX} />
              <DashboardCard label="Self Registrations" value={data.publicRegistrationsCount} icon={Globe} />
              <DashboardCard label="Admin Created" value={data.adminCreatedUsersCount} icon={Shield} />
              <DashboardCard label="Total Admins" value={data.totalAdmins} icon={Shield} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <DashboardCard label="Total Employees" value={data.totalEmployees} icon={Users} />
              <DashboardCard label="Total Receptionists" value={data.totalReceptionists} icon={Users} />
              <DashboardCard label="Registrations Today" value={data.registrationsToday || 0} icon={Clock} />
              <DashboardCard label="This Week" value={data.registrationsThisWeek || 0} icon={Clock} />
              <DashboardCard label="This Month" value={data.registrationsThisMonth || 0} icon={Clock} />
            </div>
          </div>

          {/* SECTION 3: RECHARTS VISUALIZATIONS */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chart 1: Registration Status Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Registration Status
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.registrationStatusDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {data.registrationStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Users by Role */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Users by Role
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.usersByRole}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {data.usersByRole.map((entry, index) => (
                      <Cell key={`role-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 3: Registration Source */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Registration Source
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.registrationSourceDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {data.registrationSourceDistribution.map((entry, index) => (
                      <Cell key={`src-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 4: RECENT REGISTRATIONS & RECENT USER ACTIVITY */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Registrations Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-brand-600" />
                  Recent Registration Requests
                </p>
                <Link
                  to="/admin/registrations"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {!data.recentRegistrations || data.recentRegistrations.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No registration requests recorded.</p>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="py-2">Applicant</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentRegistrations.map((r) => (
                      <tr key={r._id}>
                        <td className="py-2 font-medium text-gray-900">{r.fullName}</td>
                        <td className="py-2 capitalize">{r.requestedRole}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : r.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-400">
                          {new Date(r.submittedAt || r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent User Activity (Audit Logs) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-brand-600" />
                  Recent User & Registration Activity
                </p>
                <Link
                  to="/admin/audit-logs"
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                >
                  Audit Logs <ArrowRight size={14} />
                </Link>
              </div>

              {!data.recentUserActivity || data.recentUserActivity.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No recent activity recorded.</p>
              ) : (
                <ul className="space-y-2.5 text-xs">
                  {data.recentUserActivity.map((log) => (
                    <li key={log._id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {log.action.replace("_", " ")}
                        </span>
                        <p className="text-[11px] text-gray-500">
                          By: {log.actor?.name || log.actor?.email || "System / Public"}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
