import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function AuditLogs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/audit-logs");

      setItems(res.data.data.items || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this audit log?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await api.delete(`/audit-logs/${id}`);

      // Remove deleted item from UI immediately
      setItems((prevItems) =>
        prevItems.filter((item) => item._id !== id)
      );

      alert("Audit log deleted successfully.");
    } catch (error) {
      console.error("Failed to delete audit log:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete audit log"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">
          Audit Logs
        </h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState message="No audit entries yet." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-3 px-4">Time</th>

                <th className="py-3 px-4">
                  Actor
                </th>

                <th className="py-3 px-4">
                  Action
                </th>

                <th className="py-3 px-4">
                  Entity
                </th>

                <th className="py-3 px-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((log) => (
                <tr
                  key={log._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  {/* Time */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(
                      log.createdAt
                    ).toLocaleString()}
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-4">
                    {log.actor?.email || "system"}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4">
                    {log.action}
                  </td>

                  {/* Entity */}
                  <td className="py-3 px-4">
                    {log.entityType}
                  </td>

                  {/* Delete */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(log._id)
                      }
                      disabled={
                        deletingId === log._id
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete audit log"
                    >
                      <Trash2
                        size={15}
                        strokeWidth={2}
                      />

                      {deletingId === log._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}