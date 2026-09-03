import { useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";

export default function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  async function runReport(e) {
    e.preventDefault();

    setError("");
    setExportMessage("");
    setItems(null);

    if (!from || !to) {
      setError("Please select both From and To dates.");
      return;
    }

    if (from > to) {
      setError("From date cannot be later than To date.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/reports/range", {
        params: {
          from,
          to,
        },
      });

      setItems(res.data?.data?.items || []);
    } catch (err) {
      console.error("Report loading failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    setError("");
    setExportMessage("");

    if (!from || !to) {
      setError("Please select both From and To dates before exporting.");
      return;
    }

    if (from > to) {
      setError("From date cannot be later than To date.");
      return;
    }

    try {
      setExporting(true);

      const res = await api.get("/reports/export/csv", {
        params: {
          from,
          to,
        },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = `visits-export-${Date.now()}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      setExportMessage("CSV report downloaded successfully.");
    } catch (err) {
      console.error("CSV export failed:", err);

      setError(
        err.response?.data?.message ||
          "CSV export failed. Please try again."
      );
    } finally {
      setExporting(false);
    }
  }

  function clearReport() {
    setFrom("");
    setTo("");
    setItems(null);
    setError("");
    setExportMessage("");
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Reports
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Generate visitor reports and export visit data.
          </p>
        </div>

        {/* FILTER CARD */}
        <form
          onSubmit={runReport}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* FROM */}
            <div>
              <label
                htmlFor="from-date"
                className="text-xs font-medium text-gray-600 block mb-1"
              >
                From
              </label>

              <input
                id="from-date"
                type="date"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* TO */}
            <div>
              <label
                htmlFor="to-date"
                className="text-xs font-medium text-gray-600 block mb-1"
              >
                To
              </label>

              <input
                id="to-date"
                type="date"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* RUN REPORT */}
            <button
              type="submit"
              disabled={loading || exporting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition"
            >
              {loading ? "Loading..." : "Run Report"}
            </button>

            {/* EXPORT CSV */}
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || exporting}
              className="w-full border border-gray-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg px-4 py-2.5 transition"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {/* CLEAR */}
          <div className="mt-4">
            <button
              type="button"
              onClick={clearReport}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* EXPORT SUCCESS */}
          {exportMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                {exportMessage}
              </p>
            </div>
          )}

          {/* PDF NOTE */}
          <p className="text-xs text-gray-400 mt-4">
            PDF export is planned but not implemented in this build.
          </p>
        </form>

        {/* REPORT RESULT */}
        {items !== null && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* RESULT HEADER */}
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Visit Report
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  {from} to {to}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Total Visits:{" "}
                <span className="font-semibold text-gray-900">
                  {items.length}
                </span>
              </div>
            </div>

            {/* EMPTY STATE */}
            {items.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No visits found
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  No visitor records were found for the selected date range.
                </p>
              </div>
            ) : (
              /* TABLE */
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-5 font-medium">
                        Pass ID
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Visitor
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Host
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Department
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Status
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Visit Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        {/* PASS ID */}
                        <td className="py-3 px-5 text-gray-700">
                          {v.visitorPassId || "—"}
                        </td>

                        {/* VISITOR */}
                        <td className="py-3 px-5">
                          <div className="font-medium text-gray-900">
                            {v.visitor?.name || "—"}
                          </div>

                          {v.visitor?.mobile && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {v.visitor.mobile}
                            </div>
                          )}
                        </td>

                        {/* HOST */}
                        <td className="py-3 px-5 text-gray-700">
                          {v.host?.name || "—"}
                        </td>

                        {/* DEPARTMENT */}
                        <td className="py-3 px-5 text-gray-700">
                          {v.department?.name || "—"}
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              v.status === "COMPLETED"
                                ? "bg-green-50 text-green-700"
                                : v.status === "PENDING"
                                ? "bg-yellow-50 text-yellow-700"
                                : v.status === "APPROVED"
                                ? "bg-blue-50 text-blue-700"
                                : v.status === "REJECTED"
                                ? "bg-red-50 text-red-700"
                                : v.status === "CHECKED_IN"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {v.status || "—"}
                          </span>
                        </td>

                        {/* VISIT DATE */}
                        <td className="py-3 px-5 text-gray-600">
                          {v.visitDate
                            ? new Date(v.visitDate).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}