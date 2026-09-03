import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/notifications");
    setItems(res.data.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    load();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <button onClick={() => api.patch("/notifications/read-all").then(load)} className="text-xs text-brand-600 hover:underline">
          Mark all as read
        </button>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No notifications." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n._id} className={`bg-white border rounded-xl p-4 text-sm ${n.isRead ? "border-gray-100" : "border-brand-200"}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{n.title}</p>
                {!n.isRead && (
                  <button onClick={() => markRead(n._id)} className="text-xs text-brand-600 hover:underline">Mark read</button>
                )}
              </div>
              <p className="text-gray-500 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
