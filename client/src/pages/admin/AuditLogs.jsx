import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/audit-logs").then((res) => {
      setItems(res.data.data.items);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Audit Logs</h1>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No audit entries yet." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Time</th>
                <th className="py-2 px-4">Actor</th>
                <th className="py-2 px-4">Action</th>
                <th className="py-2 px-4">Entity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log._id} className="border-b border-gray-50">
                  <td className="py-2 px-4">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4">{log.actor?.email || "system"}</td>
                  <td className="py-2 px-4">{log.action}</td>
                  <td className="py-2 px-4">{log.entityType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
