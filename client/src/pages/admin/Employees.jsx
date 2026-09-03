import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", department: "", designation: "" });
  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);
    const [empRes, depRes] = await Promise.all([api.get("/employees"), api.get("/departments")]);
    setEmployees(empRes.data.data.items);
    setDepartments(depRes.data.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/employees", form);
      showToast("Employee added");
      setForm({ name: "", email: "", phone: "", department: "", designation: "" });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add employee", "error");
    }
  }

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Employees</h1>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid md:grid-cols-5 gap-3">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-3 py-2">Add Employee</button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState message="No employees found." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id} className="border-b border-gray-50">
                  <td className="py-2 px-4">{e.name}</td>
                  <td className="py-2 px-4">{e.email}</td>
                  <td className="py-2 px-4">{e.department?.name}</td>
                  <td className="py-2 px-4">{e.active ? "Active" : "Inactive"}</td>
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
