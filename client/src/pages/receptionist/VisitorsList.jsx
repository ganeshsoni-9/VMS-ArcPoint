import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { Search } from "lucide-react";

export default function VisitorsList() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get("/visitors", { params: { search, page, limit: 10 } }).then((res) => {
      setItems(res.data.data.items);
      setTotalPages(res.data.data.totalPages || 1);
      setLoading(false);
    });
  }, [search, page]);

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Visitors</h1>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search by name, mobile, organisation..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="w-full pl-9 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading visitors..." />
      ) : items.length === 0 ? (
        <EmptyState message="No visitors found." />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Mobile</th>
                  <th className="py-2 px-4">Organisation</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v._id} className="border-b border-gray-50">
                    <td className="py-2 px-4">{v.name}</td>
                    <td className="py-2 px-4">{v.mobile}</td>
                    <td className="py-2 px-4">{v.organisation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border border-gray-300 rounded-lg px-3 py-1 disabled:opacity-40">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border border-gray-300 rounded-lg px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
