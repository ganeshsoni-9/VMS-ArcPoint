import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import {
  Inbox,
  CheckCircle2,
  XCircle,
  DoorOpen,
  Clock3,
  Bell,
  ArrowRight,
  CalendarDays,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Users,
  UserRound,
  Building2,
  RefreshCw,
  ChevronRight,
  CircleAlert,
  Timer,
  Activity,
  ClipboardCheck,
  UserCheck,
  LogIn,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");

  const [submittingId, setSubmittingId] = useState(null);

  const [approvingVisit, setApprovingVisit] = useState(null);
  const [rejectingVisit, setRejectingVisit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { toast, showToast, clearToast } = useToast();

  async function loadDashboard() {
    setState("loading");

    try {
      const res = await api.get("/host/dashboard");

      setData(res.data.data);
      setState("success");
    } catch (err) {
      console.error("Error loading employee dashboard:", err);
      setState("error");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleApproveSubmit() {
    if (!approvingVisit) return;

    setSubmittingId(approvingVisit._id);

    try {
      await api.patch(`/host/requests/${approvingVisit._id}/approve`);

      showToast(
        "Visitor request approved successfully.",
        "success"
      );

      setApprovingVisit(null);

      await loadDashboard();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to approve request",
        "error"
      );
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();

    if (!rejectingVisit) return;

    setSubmittingId(rejectingVisit._id);

    try {
      await api.patch(
        `/host/requests/${rejectingVisit._id}/reject`,
        {
          reason: rejectionReason,
        }
      );

      showToast(
        "Visitor request rejected.",
        "success"
      );

      setRejectingVisit(null);
      setRejectionReason("");

      await loadDashboard();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to reject request",
        "error"
      );
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleMarkNotificationRead(notificationId) {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      await loadDashboard();
    } catch (err) {
      console.error(
        "Failed to mark notification as read",
        err
      );
    }
  }

  function getDurationText(checkInTime) {
    if (!checkInTime) return "N/A";

    const diffMs =
      Date.now() -
      new Date(checkInTime).getTime();

    const diffMins = Math.floor(
      diffMs / 60000
    );

    if (diffMins < 60) {
      return `${diffMins} mins`;
    }

    const hours = Math.floor(
      diffMins / 60
    );

    const mins = diffMins % 60;

    return `${hours}h ${mins}m`;
  }

  const pendingCount =
    data?.summary?.pendingRequests || 0;

  const insideCount =
    data?.summary?.currentlyInside || 0;

  const unreadCount =
    data?.unreadNotificationCount || 0;

  return (
    <Layout>
      <div className="min-h-full bg-slate-50">

        {/* =====================================================
            HERO HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-slate-950 mb-6 shadow-xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950" />

          <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-32 left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* Welcome */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Employee Workspace
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Welcome back,{" "}
                  <span className="text-indigo-300">
                    {user?.name || "Employee"}
                  </span>
                </h1>

                <p className="text-sm text-slate-400 mt-2 max-w-xl leading-6">
                  Manage your visitor requests, approve
                  guest access and keep track of visitors
                  currently inside the office.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Activity
                      size={14}
                      className="text-emerald-400"
                    />
                    System operational
                  </div>

                  <div className="w-1 h-1 bg-slate-600 rounded-full" />

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck
                      size={14}
                      className="text-indigo-400"
                    />
                    Secure access
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/employee/requests"
                  className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all"
                >
                  <Inbox size={15} />

                  View Requests

                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>

                <Link
                  to="/employee/notifications"
                  className="relative group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-900/30 transition-all"
                >
                  <Bell size={15} />

                  Notifications

                  {unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {state === "loading" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
            <LoadingSpinner
              label="Loading employee dashboard..."
            />
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {state === "error" && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8">
            <ErrorState
              message="Unable to load employee dashboard. Please check your connection and try again."
              onRetry={loadDashboard}
            />
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ===================================================== */}

        {state === "success" && data && (
          <div className="space-y-6">

            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">

              <StatCard
                title="Pending Requests"
                value={data.summary.pendingRequests}
                subtitle="Awaiting your action"
                icon={Clock3}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                valueColor="text-slate-950"
                accent="bg-amber-500"
              />

              <StatCard
                title="Approved Requests"
                value={data.summary.approvedRequests}
                subtitle="Successfully approved"
                icon={CheckCircle2}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                valueColor="text-slate-950"
                accent="bg-emerald-500"
              />

              <StatCard
                title="Rejected Requests"
                value={data.summary.rejectedRequests}
                subtitle="Requests declined"
                icon={XCircle}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                valueColor="text-slate-950"
                accent="bg-red-500"
              />

              <StatCard
                title="Currently Inside"
                value={data.summary.currentlyInside}
                subtitle="Guests on premises"
                icon={DoorOpen}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                valueColor="text-slate-950"
                accent="bg-indigo-500"
              />

            </section>

            {/* =================================================
                PENDING REQUESTS
            ================================================= */}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <SectionHeader
                icon={ClipboardCheck}
                iconClass="text-amber-600 bg-amber-50"
                title="Pending Visitor Requests"
                description="Review and respond to visitor access requests."
                actionText="View All Requests"
                actionLink="/employee/requests"
              />

              {!data.pendingRequests ||
              data.pendingRequests.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  iconClass="bg-emerald-50 text-emerald-600"
                  title="You're all caught up"
                  description="There are no pending visitor requests requiring your attention."
                />
              ) : (
                <div className="p-4 md:p-5">

                  {/* Desktop table */}
                  <div className="hidden lg:block overflow-hidden border border-slate-200 rounded-2xl">

                    <table className="w-full text-sm">

                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">

                          <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Visitor
                          </th>

                          <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Purpose
                          </th>

                          <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Department
                          </th>

                          <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Visit Date
                          </th>

                          <th className="text-right px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Action
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {data.pendingRequests.map((v) => (
                          <tr
                            key={v._id}
                            className="group hover:bg-slate-50/80 transition-colors"
                          >

                            {/* Visitor */}
                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                  <UserRound size={18} />
                                </div>

                                <div className="min-w-0">

                                  <p className="font-bold text-slate-900 truncate">
                                    {v.visitor?.name ||
                                      "Unknown Visitor"}
                                  </p>

                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                    {v.visitor?.organisation ||
                                      v.visitor?.mobile ||
                                      "Visitor"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* Purpose */}
                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2 text-slate-700">
                                <MessageSquare
                                  size={14}
                                  className="text-slate-400"
                                />

                                <span className="max-w-[180px] truncate">
                                  {v.purpose || "General Visit"}
                                </span>
                              </div>

                            </td>

                            {/* Department */}
                            <td className="px-5 py-4">

                              <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600">
                                <Building2 size={12} />

                                {v.department?.name ||
                                  "N/A"}
                              </div>

                            </td>

                            {/* Date */}
                            <td className="px-5 py-4">

                              <div>
                                <p className="text-xs font-semibold text-slate-700">
                                  {formatDate(v.visitDate)}
                                </p>

                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {formatTime(v.visitDate)}
                                </p>
                              </div>

                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  disabled={
                                    submittingId === v._id
                                  }
                                  onClick={() =>
                                    setApprovingVisit(v)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold shadow-sm transition-all"
                                >
                                  <Check size={14} />

                                  Approve
                                </button>

                                <button
                                  disabled={
                                    submittingId === v._id
                                  }
                                  onClick={() => {
                                    setRejectingVisit(v);
                                    setRejectionReason("");
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold transition-all"
                                >
                                  <X size={14} />

                                  Reject
                                </button>

                              </div>

                            </td>

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* Mobile / Tablet Cards */}
                  <div className="lg:hidden space-y-3">

                    {data.pendingRequests.map((v) => (
                      <div
                        key={v._id}
                        className="border border-slate-200 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <UserRound size={18} />
                            </div>

                            <div>

                              <p className="font-bold text-sm text-slate-900">
                                {v.visitor?.name ||
                                  "Unknown Visitor"}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {v.visitor?.organisation ||
                                  v.visitor?.mobile ||
                                  "Visitor"}
                              </p>

                            </div>

                          </div>

                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold">
                            <Clock3 size={11} />
                            Pending
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">

                          <InfoItem
                            icon={MessageSquare}
                            label="Purpose"
                            value={v.purpose || "General Visit"}
                          />

                          <InfoItem
                            icon={Building2}
                            label="Department"
                            value={
                              v.department?.name || "N/A"
                            }
                          />

                          <InfoItem
                            icon={CalendarDays}
                            label="Visit Date"
                            value={formatDate(v.visitDate)}
                          />

                          <InfoItem
                            icon={Clock3}
                            label="Time"
                            value={formatTime(v.visitDate)}
                          />

                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">

                          <button
                            disabled={
                              submittingId === v._id
                            }
                            onClick={() =>
                              setApprovingVisit(v)
                            }
                            className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                          >
                            <Check size={14} />
                            Approve
                          </button>

                          <button
                            disabled={
                              submittingId === v._id
                            }
                            onClick={() => {
                              setRejectingVisit(v);
                              setRejectionReason("");
                            }}
                            className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold"
                          >
                            <X size={14} />
                            Reject
                          </button>

                        </div>

                      </div>
                    ))}

                  </div>

                </div>
              )}
            </section>

            {/* =================================================
                INSIDE + TODAY VISITORS
            ================================================= */}

            <div className="grid xl:grid-cols-2 gap-6">

              {/* Currently Inside */}

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                <SectionHeader
                  icon={DoorOpen}
                  iconClass="text-indigo-600 bg-indigo-50"
                  title="Currently Inside"
                  description="Visitors currently present in the building."
                  rightContent={
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                      <span className="text-xs font-bold text-slate-500">
                        {insideCount} Guests
                      </span>
                    </div>
                  }
                />

                <div className="p-5">

                  {!data.currentlyInsideVisitors ||
                  data.currentlyInsideVisitors.length === 0 ? (
                    <EmptyState
                      icon={DoorOpen}
                      iconClass="bg-slate-100 text-slate-500"
                      title="No visitors inside"
                      description="Guests hosted by you who check in will appear here."
                    />
                  ) : (
                    <div className="space-y-3">

                      {data.currentlyInsideVisitors.map(
                        (v) => (
                          <div
                            key={v._id}
                            className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-4 hover:shadow-md hover:border-indigo-200 transition-all"
                          >

                            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-100/30 rounded-full blur-2xl" />

                            <div className="relative flex items-center justify-between gap-4">

                              <div className="flex items-center gap-3 min-w-0">

                                <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                  <UserCheck size={19} />
                                </div>

                                <div className="min-w-0">

                                  <p className="font-bold text-sm text-slate-900 truncate">
                                    {v.visitor?.name ||
                                      "Visitor"}
                                  </p>

                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {v.visitor?.organisation ||
                                      v.purpose}
                                  </p>

                                  <p className="text-[10px] text-slate-400 mt-1">
                                    Pass:{" "}
                                    <span className="font-mono font-semibold text-slate-500">
                                      {v.visitorPassId ||
                                        "N/A"}
                                    </span>
                                  </p>

                                </div>

                              </div>

                              <div className="text-right shrink-0">

                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Inside
                                </span>

                                <p className="text-[10px] text-slate-400 mt-2">
                                  In:{" "}
                                  {v.checkInTime
                                    ? new Date(
                                        v.checkInTime
                                      ).toLocaleTimeString(
                                        [],
                                        {
                                          hour: "2-digit",
                                          minute:
                                            "2-digit",
                                        }
                                      )
                                    : "N/A"}
                                </p>

                                <p className="text-[10px] font-bold text-indigo-600 mt-0.5 flex items-center justify-end gap-1">
                                  <Timer size={11} />

                                  {getDurationText(
                                    v.checkInTime
                                  )}
                                </p>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </section>

              {/* Today's Visitors */}

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                <SectionHeader
                  icon={CalendarDays}
                  iconClass="text-blue-600 bg-blue-50"
                  title="Today's Visitors"
                  description="Scheduled visitors for today."
                  rightContent={
                    <span className="text-xs font-bold text-slate-400">
                      {data.todayVisitors?.length ||
                        0}{" "}
                      Total
                    </span>
                  }
                />

                <div className="p-5">

                  {!data.todayVisitors ||
                  data.todayVisitors.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      iconClass="bg-slate-100 text-slate-500"
                      title="No visitors scheduled"
                      description="Today's scheduled visitor appointments will appear here."
                    />
                  ) : (
                    <div className="space-y-2.5">

                      {data.todayVisitors.map((v) => (
                        <div
                          key={v._id}
                          className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                        >

                          <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                            <UserRound size={17} />
                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="text-xs font-bold text-slate-900 truncate">
                              {v.visitor?.name ||
                                "Visitor"}
                            </p>

                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {v.purpose ||
                                "General Visit"}
                            </p>

                          </div>

                          <div className="text-right shrink-0">

                            <StatusBadge
                              status={v.status}
                            />

                            <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                              <Clock3 size={10} />

                              {v.visitDate
                                ? new Date(
                                    v.visitDate
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </p>

                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                </div>

              </section>

            </div>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <SectionHeader
                icon={Bell}
                iconClass="text-indigo-600 bg-indigo-50"
                title="Recent Notifications"
                description="Stay updated with visitor and system activity."
                actionText="View All Notifications"
                actionLink="/employee/notifications"
              />

              {!data.recentNotifications ||
              data.recentNotifications.length === 0 ? (
                <div className="px-5 pb-5">
                  <EmptyState
                    icon={Bell}
                    iconClass="bg-slate-100 text-slate-500"
                    title="No notifications"
                    description="New visitor activity and system alerts will appear here."
                  />
                </div>
              ) : (
                <div className="p-5">

                  <div className="space-y-2.5">

                    {data.recentNotifications.map((n) => (
                      <div
                        key={n._id}
                        className={`group rounded-2xl border p-4 transition-all ${
                          n.isRead
                            ? "bg-white border-slate-100 hover:border-slate-200"
                            : "bg-indigo-50/50 border-indigo-100 hover:border-indigo-200"
                        }`}
                      >

                        <div className="flex items-start gap-3">

                          <div
                            className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                              n.isRead
                                ? "bg-slate-100 text-slate-500"
                                : "bg-indigo-100 text-indigo-600"
                            }`}
                          >
                            <Bell size={16} />
                          </div>

                          <div className="flex-1 min-w-0">

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

                              <div className="flex items-center gap-2">

                                <p className="text-xs font-bold text-slate-900">
                                  {n.title}
                                </p>

                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                )}

                              </div>

                              {!n.isRead && (
                                <button
                                  onClick={() =>
                                    handleMarkNotificationRead(
                                      n._id
                                    )
                                  }
                                  className="self-start sm:self-auto text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                >
                                  Mark as read
                                </button>
                              )}

                            </div>

                            <p className="text-[11px] text-slate-500 mt-1 leading-5">
                              {n.message}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-2">
                              {new Date(
                                n.createdAt
                              ).toLocaleString()}
                            </p>

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>

                </div>
              )}

            </section>

            {/* =================================================
                FOOTER STATUS
            ================================================= */}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pb-3">

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck
                  size={13}
                  className="text-emerald-500"
                />
                Secure Employee Workspace
              </div>

              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw size={12} />
                Refresh Dashboard
              </button>

            </div>

          </div>
        )}
      </div>

      {/* =====================================================
          APPROVE MODAL
      ===================================================== */}

      {approvingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={23} />
                </div>

                <button
                  onClick={() =>
                    setApprovingVisit(null)
                  }
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
                >
                  <X size={17} />
                </button>

              </div>

              <h3 className="text-lg font-bold text-slate-950 mt-5">
                Approve Visitor Request
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                You are about to approve the visitor
                request for{" "}
                <strong className="text-slate-900">
                  {approvingVisit.visitor?.name}
                </strong>
                .
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center">
                    <UserRound size={18} />
                  </div>

                  <div>

                    <p className="text-xs font-bold text-slate-900">
                      {approvingVisit.visitor?.name}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {approvingVisit.purpose ||
                        "Visitor Appointment"}
                    </p>

                  </div>

                </div>

              </div>

              <div className="flex gap-2 mt-6">

                <button
                  disabled={
                    submittingId ===
                    approvingVisit._id
                  }
                  onClick={() =>
                    setApprovingVisit(null)
                  }
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  disabled={
                    submittingId ===
                    approvingVisit._id
                  }
                  onClick={handleApproveSubmit}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
                >
                  {submittingId ===
                  approvingVisit._id ? (
                    <>
                      <LoaderIcon />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Confirm Approval
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {rejectingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">

          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                    <CircleAlert size={23} />
                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-slate-950">
                      Reject Visit Request
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      This action will decline the request.
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setRejectingVisit(null)
                  }
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                >
                  <X size={17} />
                </button>

              </div>

              <div className="mt-5 p-4 rounded-2xl bg-red-50/50 border border-red-100">

                <p className="text-xs text-slate-600 leading-5">
                  Are you sure you want to reject the
                  visit request for{" "}
                  <strong className="text-slate-900">
                    {rejectingVisit.visitor?.name}
                  </strong>
                  ?
                </p>

              </div>

              <form
                onSubmit={handleRejectSubmit}
                className="mt-5 space-y-4"
              >

                <div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <MessageSquare size={14} />
                    Reason for Rejection
                    <span className="text-slate-400 font-normal">
                      Optional
                    </span>
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Explain why this visitor request is being rejected..."
                    value={rejectionReason}
                    onChange={(e) =>
                      setRejectionReason(
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none resize-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                  />

                </div>

                <div className="flex gap-2 pt-2">

                  <button
                    type="button"
                    onClick={() =>
                      setRejectingVisit(null)
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submittingId ===
                      rejectingVisit._id
                    }
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center justify-center gap-2"
                  >
                    {submittingId ===
                    rejectingVisit._id ? (
                      <>
                        <LoaderIcon />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X size={15} />
                        Confirm Rejection
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <Toast
          {...toast}
          onClose={clearToast}
        />
      )}
    </Layout>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`}
      />

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="text-3xl font-bold text-slate-950 mt-2 tracking-tight">
            {value}
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            {subtitle}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center group-hover:scale-105 transition-transform`}
        >
          <Icon size={20} />
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  description,
  actionText,
  actionLink,
  rightContent,
}) {
  return (
    <div className="px-5 py-4 border-b border-slate-100">

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3 min-w-0">

          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0">

            <h2 className="text-sm font-bold text-slate-950 truncate">
              {title}
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {description}
            </p>

          </div>

        </div>

        {actionText && actionLink ? (
          <Link
            to={actionLink}
            className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            {actionText}
            <ChevronRight size={13} />
          </Link>
        ) : (
          rightContent
        )}

      </div>

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  icon: Icon,
  iconClass,
  title,
  description,
}) {
  return (
    <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">

      <div
        className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${iconClass}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-xs font-bold text-slate-800 mt-3">
        {title}
      </p>

      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-5">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0">

      <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
        <Icon size={10} />
        {label}
      </p>

      <p className="text-[11px] font-semibold text-slate-700 truncate mt-1">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   LOADER
============================================================ */

function LoaderIcon() {
  return (
    <RefreshCw
      size={15}
      className="animate-spin"
    />
  );
}

/* ============================================================
   DATE HELPERS
============================================================ */

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}