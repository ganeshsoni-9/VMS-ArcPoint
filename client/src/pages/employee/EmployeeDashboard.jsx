import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
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
  Clock,
  Bell,
  ArrowRight,
  UserCheck,
  Building2,
  Calendar,
  Check,
  X,
  MessageSquare,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [submittingId, setSubmittingId] = useState(null);
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

  async function handleApprove(visitId) {
    setSubmittingId(visitId);
    try {
      await api.patch(`/host/requests/${visitId}/approve`);
      showToast("Visitor request approved successfully!", "success");
      await loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve request", "error");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectingVisit) return;

    setSubmittingId(rejectingVisit._id);
    try {
      await api.patch(`/host/requests/${rejectingVisit._id}/reject`, {
        reason: rejectionReason,
      });
      showToast("Visitor request rejected.", "success");
      setRejectingVisit(null);
      setRejectionReason("");
      await loadDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject request", "error");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleMarkNotificationRead(notificationId) {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      await loadDashboard();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  // Calculate elapsed duration for inside visitors
  function getDurationText(checkInTime) {
    if (!checkInTime) return "N/A";
    const diffMs = Date.now() - new Date(checkInTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} mins`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }

  return (
    <Layout>
      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.name || "Employee"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your visitor requests, approvals, and currently inside guests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/employee/requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Inbox size={14} className="text-brand-600" />
            View Requests
          </Link>
          <Link
            to="/employee/notifications"
            className="relative inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Bell size={14} />
            Notifications
            {data?.unreadNotificationCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {data.unreadNotificationCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* LOADING / ERROR STATES */}
      {state === "loading" && <LoadingSpinner label="Loading employee dashboard..." />}

      {state === "error" && (
        <ErrorState
          message="Unable to load employee dashboard. Please check your connection and try again."
          onRetry={loadDashboard}
        />
      )}

      {state === "success" && data && (
        <div className="space-y-6">
          {/* TOP 4 SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardCard
              label="Pending Requests"
              value={data.summary.pendingRequests}
              icon={Clock}
            />
            <DashboardCard
              label="Approved Requests"
              value={data.summary.approvedRequests}
              icon={CheckCircle2}
            />
            <DashboardCard
              label="Rejected Requests"
              value={data.summary.rejectedRequests}
              icon={XCircle}
            />
            <DashboardCard
              label="Currently Inside"
              value={data.summary.currentlyInside}
              icon={DoorOpen}
            />
          </div>

          {/* SECTION 1: PENDING VISITOR REQUESTS */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  Pending Visitor Requests
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Action required: approve or reject guest access requests.
                </p>
              </div>

              <Link
                to="/employee/requests"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View All Requests <ArrowRight size={14} />
              </Link>
            </div>

            {!data.pendingRequests || data.pendingRequests.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-sm font-semibold text-gray-800">No pending visitor requests</p>
                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up. New visitor requests will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Visitor</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Visit Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.pendingRequests.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-gray-900">{v.visitor?.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {v.visitor?.organisation || v.visitor?.mobile}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-gray-700">{v.purpose}</td>
                        <td className="py-3 px-3 text-gray-600">
                          {v.department?.name || "N/A"}
                        </td>
                        <td className="py-3 px-3 text-gray-500">
                          {new Date(v.visitDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              disabled={submittingId === v._id}
                              onClick={() => handleApprove(v._id)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Check size={14} />
                              {submittingId === v._id ? "Processing..." : "Approve"}
                            </button>
                            <button
                              disabled={submittingId === v._id}
                              onClick={() => {
                                setRejectingVisit(v);
                                setRejectionReason("");
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
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
            )}
          </div>

          {/* SECTION 2: CURRENTLY INSIDE & TODAY'S VISITORS */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Currently Inside Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <DoorOpen size={18} className="text-brand-600" />
                  Currently Inside Building
                </h2>
                <span className="text-xs text-gray-400">
                  {data.currentlyInsideVisitors?.length || 0} Guests
                </span>
              </div>

              {!data.currentlyInsideVisitors || data.currentlyInsideVisitors.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DoorOpen size={20} />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">No visitors currently inside</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Guests hosted by you who check in will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.currentlyInsideVisitors.map((v) => (
                    <div
                      key={v._id}
                      className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-gray-900">{v.visitor?.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {v.visitor?.organisation || v.purpose}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Pass: <span className="font-mono">{v.visitorPassId}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                          Inside
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                          In: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                        </p>
                        <p className="text-[10px] font-medium text-brand-600">
                          Duration: {getDurationText(v.checkInTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's Visitors Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-brand-600" />
                  Today's Scheduled Visitors
                </h2>
                <span className="text-xs text-gray-400">
                  {data.todayVisitors?.length || 0} Total
                </span>
              </div>

              {!data.todayVisitors || data.todayVisitors.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                  <p className="text-xs font-semibold text-gray-700">No visitors scheduled for today</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Today's visitor passes and check-ins will be logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {data.todayVisitors.map((v) => (
                    <div
                      key={v._id}
                      className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{v.visitor?.name}</p>
                        <p className="text-[11px] text-gray-500">{v.purpose}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={v.status} />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(v.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: RECENT NOTIFICATIONS PREVIEW */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-brand-600" />
                Recent Notifications
              </h2>

              <Link
                to="/employee/notifications"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View All Notifications <ArrowRight size={14} />
              </Link>
            </div>

            {!data.recentNotifications || data.recentNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No notifications recorded.</p>
            ) : (
              <div className="space-y-2">
                {data.recentNotifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between transition-colors ${
                      n.isRead
                        ? "bg-white border-gray-100 text-gray-600"
                        : "bg-brand-50/40 border-brand-200 text-gray-900"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkNotificationRead(n._id)}
                        className="text-[11px] text-brand-600 hover:underline font-medium shrink-0 ml-2"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Reject Visit Request
              </h3>
              <button
                onClick={() => setRejectingVisit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-gray-600">
                Are you sure you want to reject the visit request for{" "}
                <strong>{rejectingVisit.visitor?.name}</strong>?
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a reason for the visitor..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRejectingVisit(null)}
                  className="px-3.5 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingId === rejectingVisit._id}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg"
                >
                  {submittingId === rejectingVisit._id ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
