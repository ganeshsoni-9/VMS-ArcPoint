import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function Requests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    const res = await api.get("/host/requests");
    setItems(res.data.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id, action) {
    try {
      await api.patch(`/host/requests/${id}/${action}`);
      showToast(`Visit ${action}d`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed", "error");
    }
  }

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Visitor Requests</h1>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No visitor requests." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Visitor</th>
                <th className="py-2 px-4">Purpose</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v._id} className="border-b border-gray-50">
                  <td className="py-2 px-4">{v.visitor?.name}</td>
                  <td className="py-2 px-4">{v.purpose}</td>
                  <td className="py-2 px-4"><StatusBadge status={v.status} /></td>
                  <td className="py-2 px-4">
                    {v.status === "PENDING" && (
                      <div className="flex gap-3">
                        <button onClick={() => respond(v._id, "approve")} className="text-green-600 hover:underline text-xs font-medium">Approve</button>
                        <button onClick={() => respond(v._id, "reject")} className="text-red-600 hover:underline text-xs font-medium">Reject</button>
                      </div>
                    )}
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
