import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    const res = await api.get("/departments");
    setDepartments(res.data.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/departments", { name });
      showToast("Department added");
      setName("");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add department", "error");
    }
  }

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Departments</h1>
      <form onSubmit={onSubmit} className="flex gap-3 mb-6">
        <input required placeholder="Department name" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs" />
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2">Add</button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {departments.map((d) => (
            <div key={d._id} className="bg-white border border-gray-200 rounded-xl p-4 text-sm flex items-center justify-between">
              {d.name}
              <span className={d.active ? "text-green-600 text-xs" : "text-gray-400 text-xs"}>{d.active ? "Active" : "Inactive"}</span>
            </div>
          ))}
        </div>
      )}
      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
