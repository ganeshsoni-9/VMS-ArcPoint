import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import { LogOut, DoorOpen, CheckCircle2 } from "lucide-react";

export default function CurrentlyInside() {
  const [items, setItems] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmVisit, setConfirmVisit] = useState(null); // Visit object to confirm check-out
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [insideRes, approvedRes] = await Promise.all([
        api.get("/visits/inside"),
        api.get("/visits", { params: { status: "APPROVED", limit: 20 } }),
      ]);
      setItems(insideRes.data.data.items || []);
      setApproved(approvedRes.data.data.items || []);
    } catch (err) {
      showToast("Failed to load inside visitors", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function checkIn(id) {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${id}/check-in`);
      showToast("Visitor checked in successfully.", "success");
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-in failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut(id) {
    setActionLoading(true);
    try {
      const res = await api.patch(`/visits/${id}/check-out`);
      const duration = res.data.data.durationMinutes;
      showToast(`Visitor checked out successfully. Duration: ${duration} mins`, "success");
      setConfirmVisit(null);
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-out failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Layout>
      {/* APPROVED VISITORS READY FOR CHECK-IN */}
      {approved.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              Approved Visitors — Ready for Check-in ({approved.length})
            </h2>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-blue-50/50 text-blue-900 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Visitor</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4">Organisation</th>
                  <th className="py-2.5 px-4">Host</th>
                  <th className="py-2.5 px-4">Pass ID</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {approved.map((v) => (
                  <tr key={v._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{v.visitor?.name}</td>
                    <td className="py-2.5 px-4 text-gray-600">{v.visitor?.mobile}</td>
                    <td className="py-2.5 px-4 text-gray-600">{v.visitor?.organisation || "-"}</td>
                    <td className="py-2.5 px-4 text-gray-700">{v.host?.name}</td>
                    <td className="py-2.5 px-4 font-mono text-blue-600">{v.visitorPassId}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        disabled={actionLoading}
                        onClick={() => checkIn(v._id)}
                        className="px-3 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-md font-medium text-xs shadow-sm transition-colors"
                      >
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CURRENTLY INSIDE TABLE */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <DoorOpen size={22} className="text-green-600" />
            Currently Inside Office
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time physical presence monitoring for office visitors.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full">
          {items.length} Active Guests
        </span>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading active guests inside building..." />
      ) : items.length === 0 ? (
        <EmptyState message="No visitors currently inside the office." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Organisation</th>
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Visitor Pass ID</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{v.visitor?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{v.visitor?.mobile || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{v.visitor?.organisation || "-"}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{v.host?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{v.department?.name || "-"}</td>
                  <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{v.purpose}</td>
                  <td className="py-3 px-4 font-mono font-medium text-brand-600">{v.visitorPassId}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setConfirmVisit(v)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <LogOut size={14} />
                      Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-sm w-full p-6 shadow-xl text-center">
            <h3 className="text-base font-bold text-gray-900 mb-2">Confirm Check-Out</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Confirm that <strong>{confirmVisit.visitor?.name}</strong> has left the office?
            </p>
            <div className="flex justify-center gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmVisit(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleCheckOut(confirmVisit._id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Checking Out..." : "Confirm Check Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
