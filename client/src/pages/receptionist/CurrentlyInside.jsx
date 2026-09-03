import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function CurrentlyInside() {
  const [items, setItems] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    const [insideRes, approvedRes] = await Promise.all([
      api.get("/visits/currently-inside"),
      api.get("/visits", { params: { status: "APPROVED", limit: 20 } }),
    ]);
    setItems(insideRes.data.data.items);
    setApproved(approvedRes.data.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function checkIn(id) {
    try {
      await api.patch(`/visits/${id}/check-in`);
      showToast("Visitor checked in");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-in failed", "error");
    }
  }

  async function checkOut(id) {
    try {
      const res = await api.patch(`/visits/${id}/check-out`);
      showToast(`Checked out. Duration: ${res.data.data.durationMinutes} min`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Check-out failed", "error");
    }
  }

  return (
    <Layout>
      {approved.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Approved — ready for check-in</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 px-4">Visitor</th>
                  <th className="py-2 px-4">Host</th>
                  <th className="py-2 px-4">Visitor ID</th>
                  <th className="py-2 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {approved.map((v) => (
                  <tr key={v._id} className="border-b border-gray-50">
                    <td className="py-2 px-4">{v.visitor?.name}</td>
                    <td className="py-2 px-4">{v.host?.name}</td>
                    <td className="py-2 px-4 font-mono text-xs">{v.visitorPassId}</td>
                    <td className="py-2 px-4">
                      <button onClick={() => checkIn(v._id)} className="text-brand-600 hover:underline text-xs font-medium">Check-in</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h1 className="text-lg font-semibold mb-4">Currently Inside</h1>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No visitors currently inside." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Visitor</th>
                <th className="py-2 px-4">Host</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Check-in</th>
                <th className="py-2 px-4">Visitor ID</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v._id} className="border-b border-gray-50">
                  <td className="py-2 px-4">{v.visitor?.name}</td>
                  <td className="py-2 px-4">{v.host?.name}</td>
                  <td className="py-2 px-4">{v.department?.name}</td>
                  <td className="py-2 px-4">{new Date(v.checkInTime).toLocaleTimeString()}</td>
                  <td className="py-2 px-4 font-mono text-xs">{v.visitorPassId}</td>
                  <td className="py-2 px-4">
                    <button onClick={() => checkOut(v._id)} className="text-brand-600 hover:underline text-xs font-medium">
                      Check-out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
