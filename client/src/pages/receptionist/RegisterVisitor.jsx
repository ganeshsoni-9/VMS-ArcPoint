import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

const initialForm = {
  name: "", mobile: "", email: "", organisation: "", host: "", department: "",
  purpose: "", visitDate: "", vehicleNumber: "", itemsCarried: "", consent: false,
};

export default function RegisterVisitor() {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [result, setResult] = useState(null);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data.data.items));
    api.get("/departments").then((res) => setDepartments(res.data.data.items));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.consent) {
      showToast("Consent is required", "error");
      return;
    }
    try {
      const res = await api.post("/visitors", form);
      setResult(res.data.data);
      showToast("Visitor registered successfully");
      setForm(initialForm);
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed", "error");
    }
  }

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Register Visitor</h1>

      {result && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-4 mb-6 text-sm shadow-sm">
          <p className="font-semibold text-blue-950 mb-1">
            Visitor registered successfully. The request has been sent to the selected employee for approval.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2 pt-2 border-t border-blue-200/60">
            <div><span className="text-gray-500">Visitor Pass ID:</span> <span className="font-mono font-bold text-blue-700">{result.visit.visitorPassId}</span></div>
            <div><span className="text-gray-500">Visitor Name:</span> <span className="font-medium text-gray-900">{result.visitor.name}</span></div>
            <div><span className="text-gray-500">Host:</span> <span className="font-medium text-gray-900">{employees.find((e) => e._id === result.visit.host)?.name || "Selected Employee"}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Pending Employee Approval</span></div>
          </div>
          {result.blacklisted && <p className="text-red-600 mt-2 text-xs font-semibold">⚠ Warning: Visitor is flagged on the blacklist.</p>}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-6 grid md:grid-cols-2 gap-4 max-w-3xl">
        <input required placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input required placeholder="Mobile number *" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Organisation" value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />

        <select required value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Host / Employee *</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Department *</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <input required placeholder="Purpose of visit *" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2" />
        <input required type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Items carried" value={form.itemsCarried} onChange={(e) => setForm({ ...form, itemsCarried: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2" />

        <p className="text-xs text-gray-400 md:col-span-2">
          Photo and identity-document upload are intentionally out of scope for this build (would need Multer + secure storage wiring); the
          backend already exposes a private, authenticated document endpoint ready for that once uploads are added.
        </p>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
          Visitor has given consent to store their data *
        </label>

        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2 md:col-span-2">
          Register Visitor
        </button>
      </form>

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
