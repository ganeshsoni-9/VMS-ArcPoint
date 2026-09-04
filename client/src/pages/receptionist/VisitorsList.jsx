import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import { Search, LogIn, LogOut } from "lucide-react";

export default function VisitorsList() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'checkIn' | 'checkOut', visit }
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  async function loadVisits() {
    setLoading(true);
    try {
      const res = await api.get("/visits", { params: { search, page, limit: 10 } });
      setItems(res.data.data.items || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch (err) {
      showToast("Failed to load visits", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVisits();
  }, [page]);

  // Client-side search filtering if backend list search is exact
  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const vName = item.visitor?.name?.toLowerCase() || "";
    const vMobile = item.visitor?.mobile?.toLowerCase() || "";
    const vOrg = item.visitor?.organisation?.toLowerCase() || "";
    const passId = item.visitorPassId?.toLowerCase() || "";
    return vName.includes(q) || vMobile.includes(q) || vOrg.includes(q) || passId.includes(q);
  });

  async function handleCheckIn(visitId) {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/check-in`);
      showToast("Visitor checked in successfully.", "success");
      setConfirmAction(null);
      await loadVisits();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-in failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut(visitId) {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/check-out`);
      showToast("Visitor checked out successfully.", "success");
      setConfirmAction(null);
      await loadVisits();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-out failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-lg font-semibold">Visitors Log</h1>
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by name, mobile, organisation, pass ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading visitor logs..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState message="No visitors found." />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 bg-gray-50/50 text-xs uppercase font-medium">
                  <th className="py-3 px-4">Visitor</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Organisation</th>
                  <th className="py-3 px-4">Host Employee</th>
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{v.visitor?.name || "N/A"}</p>
                      <p className="text-xs text-gray-400">{v.purpose}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{v.visitor?.mobile || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-600">{v.visitor?.organisation || "-"}</td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{v.host?.name || "N/A"}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{v.visitorPassId}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {v.status === "APPROVED" && (
                        <button
                          onClick={() => setConfirmAction({ type: "checkIn", visit: v })}
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <LogIn size={14} />
                          Check In
                        </button>
                      )}
                      {v.status === "INSIDE" && (
                        <button
                          onClick={() => setConfirmAction({ type: "checkOut", visit: v })}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <LogOut size={14} />
                          Check Out
                        </button>
                      )}
                      {v.status === "PENDING" && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          Waiting for Approval
                        </span>
                      )}
                      {v.status === "COMPLETED" && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                          Completed
                        </span>
                      )}
                      {v.status === "REJECTED" && (
                        <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {confirmAction.type === "checkIn" ? "Confirm Check-In" : "Confirm Check-Out"}
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              {confirmAction.type === "checkIn"
                ? `Confirm that ${confirmAction.visit.visitor?.name} has entered the office?`
                : `Confirm that ${confirmAction.visit.visitor?.name} has left the office?`}
            </p>
            <div className="flex justify-center gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() =>
                  confirmAction.type === "checkIn"
                    ? handleCheckIn(confirmAction.visit._id)
                    : handleCheckOut(confirmAction.visit._id)
                }
                className={`px-4 py-2 text-white text-xs font-medium rounded-lg disabled:opacity-50 ${
                  confirmAction.type === "checkIn"
                    ? "bg-brand-600 hover:bg-brand-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : confirmAction.type === "checkIn"
                  ? "Check In"
                  : "Check Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
