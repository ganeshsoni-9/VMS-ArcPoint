import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
  X,
  FileText,
  UserCheck,
} from "lucide-react";

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, clearToast } = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get("/registrations");
      setRegistrations(res.data.data.items || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load registrations", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = registrations.filter((r) => {
    const name = (r.fullName || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    const phone = (r.phone || "").toLowerCase();
    const regId = (r.registrationId || "").toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase()) ||
      regId.includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || r.requestedRole === roleFilter;
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesSource = !sourceFilter || r.registrationSource === sourceFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesSource;
  });

  // Approve Handler
  async function handleApprove(registration) {
    if (!window.confirm(`Approve registration for ${registration.fullName}?`)) return;

    try {
      await api.post(`/registrations/${registration._id}/approve`);
      showToast("Registration approved and User account created!");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Approval failed", "error");
    }
  }

  // Reject Handler
  function openRejectModal(registration) {
    setSelectedReg(registration);
    setRejectionReason("");
    setShowRejectModal(true);
  }

  async function handleReject(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/registrations/${selectedReg._id}/reject`, {
        rejectionReason,
      });
      showToast("Registration request rejected");
      setShowRejectModal(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Rejection failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function openViewModal(registration) {
    setSelectedReg(registration);
    setShowViewModal(true);
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Registration Requests</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review, approve, or reject user account requests submitted for VMS access.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="receptionist">Receptionist</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Sources</option>
            <option value="PUBLIC_REGISTRATION">Public Registration</option>
            <option value="ADMIN_CREATED">Admin Created</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner label="Loading registration requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No registration requests match your filters." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Requested Role</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-brand-700 text-xs">
                      {item.registrationId}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.fullName}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                        {item.phone && <p className="text-xs text-gray-400">{item.phone}</p>}
                      </div>
                    </td>

                    <td className="py-3 px-4 capitalize">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {item.requestedRole}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {item.registrationSource === "PUBLIC_REGISTRATION" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200">
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Admin Created
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(item.submittedAt || item.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          title="View Details"
                          onClick={() => openViewModal(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </button>

                        {item.status === "PENDING" && (
                          <>
                            <button
                              title="Approve Registration"
                              onClick={() => handleApprove(item)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              title="Reject Registration"
                              onClick={() => openRejectModal(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reject Registration</h3>
                <p className="text-xs text-gray-500">
                  Reject request for {selectedReg.fullName} ({selectedReg.registrationId})
                </p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Invalid profile or unverified employment details."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                  {selectedReg.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedReg.fullName}</h3>
                  <span className="text-xs font-mono text-brand-700 font-semibold">
                    {selectedReg.registrationId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-200">
                <p className="font-semibold text-gray-800 text-xs border-b border-gray-200 pb-1 mb-2">
                  Personal Information
                </p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="text-gray-900 font-medium">{selectedReg.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email Address:</span>
                  <span className="text-gray-900">{selectedReg.email}</span>
                </div>
                {selectedReg.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900">{selectedReg.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-200">
                <p className="font-semibold text-gray-800 text-xs border-b border-gray-200 pb-1 mb-2">
                  Application Information
                </p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Role:</span>
                  <span className="capitalize font-semibold text-gray-900">
                    {selectedReg.requestedRole}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration Source:</span>
                  <span className="font-semibold text-brand-700">
                    {selectedReg.registrationSource}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(
                      selectedReg.status
                    )}`}
                  >
                    {selectedReg.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-200">
                <p className="font-semibold text-gray-800 text-xs border-b border-gray-200 pb-1 mb-2">
                  Timeline & Audit
                </p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted At:</span>
                  <span className="text-gray-700">
                    {new Date(selectedReg.submittedAt || selectedReg.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedReg.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reviewed At:</span>
                    <span className="text-gray-700">
                      {new Date(selectedReg.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedReg.reviewedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reviewed By Admin:</span>
                    <span className="text-gray-900 font-medium">
                      {selectedReg.reviewedBy.name || selectedReg.reviewedBy.email}
                    </span>
                  </div>
                )}
              </div>

              {selectedReg.status === "REJECTED" && selectedReg.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                  <p className="font-semibold">Rejection Reason:</p>
                  <p className="mt-0.5">{selectedReg.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-4">
              {selectedReg.status === "PENDING" && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openRejectModal(selectedReg);
                    }}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleApprove(selectedReg);
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 text-xs font-semibold rounded-lg"
                  >
                    Approve Request
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
