import { useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";

export default function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState(null);

  async function runReport(e) {
    e.preventDefault();
    const res = await api.get("/reports/range", { params: { from, to } });
    setItems(res.data.data.items);
  }

  async function exportCsv() {
    const res = await api.get("/reports/export/csv", { params: { from, to }, responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `visits-export-${Date.now()}.csv`;
    a.click();
  }

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Reports</h1>
      <form onSubmit={runReport} className="flex flex-wrap items-end gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" required value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2">Run Report</button>
        <button type="button" onClick={exportCsv} className="border border-gray-300 text-sm font-medium rounded-lg px-4 py-2">Export CSV</button>
        <p className="text-xs text-gray-400 w-full mt-1">PDF export is planned but not implemented in this build (labelled per assignment realism rule).</p>
      </form>

      {items && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-4">Pass ID</th>
                <th className="py-2 px-4">Visitor</th>
                <th className="py-2 px-4">Host</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v._id} className="border-b border-gray-50">
                  <td className="py-2 px-4">{v.visitorPassId}</td>
                  <td className="py-2 px-4">{v.visitor?.name}</td>
                  <td className="py-2 px-4">{v.host?.name}</td>
                  <td className="py-2 px-4">{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
