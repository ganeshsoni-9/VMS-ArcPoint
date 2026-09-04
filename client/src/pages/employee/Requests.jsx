import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import { Check, X } from "lucide-react";

export default function Requests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingVisit, setApprovingVisit] = useState(null);
  const [rejectingVisit, setRejectingVisit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/host/requests");
      setItems(res.data.data.items || []);
    } catch (err) {
      showToast("Failed to load visitor requests", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApproveSubmit() {
    if (!approvingVisit) return;
    setSubmittingId(approvingVisit._id);
    try {
      await api.patch(`/host/requests/${approvingVisit._id}/approve`);
      showToast("Visitor request approved successfully.", "success");
      setApprovingVisit(null);
      await load();
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
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject request", "error");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Visitor Requests</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Review and approve or reject visitor access requests assigned to you.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading requests..." />
      ) : items.length === 0 ? (
        <EmptyState message="No visitor requests found." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3">Visitor Name</th>
                <th className="py-3 px-3">Mobile</th>
                <th className="py-3 px-3">Organisation</th>
                <th className="py-3 px-3">Purpose</th>
                <th className="py-3 px-3">Visit Date</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Pass ID</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Request Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-gray-900">{v.visitor?.name || "N/A"}</td>
                  <td className="py-3 px-3 text-gray-600">{v.visitor?.mobile || "N/A"}</td>
                  <td className="py-3 px-3 text-gray-600">{v.visitor?.organisation || "-"}</td>
                  <td className="py-3 px-3 text-gray-700 max-w-xs truncate">{v.purpose}</td>
                  <td className="py-3 px-3 text-gray-600">
                    {new Date(v.visitDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{v.department?.name || "-"}</td>
                  <td className="py-3 px-3 font-mono font-medium text-brand-600">{v.visitorPassId}</td>
                  <td className="py-3 px-3 text-gray-500">{v.vehicleNumber || "-"}</td>
                  <td className="py-3 px-3 text-gray-500">{v.itemsCarried || "-"}</td>
                  <td className="py-3 px-3 text-gray-400">
                    {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {v.status === "PENDING" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          disabled={submittingId === v._id}
                          onClick={() => setApprovingVisit(v)}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Check size={13} />
                          Approve
                        </button>
                        <button
                          disabled={submittingId === v._id}
                          onClick={() => {
                            setRejectingVisit(v);
                            setRejectionReason("");
                          }}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Responded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* APPROVAL CONFIRMATION DIALOG */}
      {approvingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Approve Visitor Request</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Approve visitor request from <strong>{approvingVisit.visitor?.name}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                disabled={submittingId === approvingVisit._id}
                onClick={() => setApprovingVisit(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={submittingId === approvingVisit._id}
                onClick={handleApproveSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
              >
                {submittingId === approvingVisit._id ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Reject Visitor Request</h3>
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
                  placeholder="Provide a reason..."
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
                  {submittingId === rejectingVisit._id ? "Rejecting..." : "Reject Visitor"}
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
