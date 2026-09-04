import { useState } from "react";
import { FileDown, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";

export default function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [items, setItems] = useState(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);

  const [error, setError] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  // --------------------------------------------------
  // RUN REPORT
  // --------------------------------------------------
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

  // --------------------------------------------------
  // CSV EXPORT
  // --------------------------------------------------
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
      a.download = `visits-report-${from}-to-${to}.csv`;

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

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------
  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // --------------------------------------------------
  // FORMAT DATE + TIME
  // --------------------------------------------------
  function formatDateTime(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // --------------------------------------------------
  // DURATION
  // --------------------------------------------------
  function getDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return "—";

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference = end - start;

    if (difference < 0) return "—";

    const totalMinutes = Math.floor(difference / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  }

  // --------------------------------------------------
  // STATUS STYLE
  // --------------------------------------------------
  function getStatusClass(status) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700";

      case "APPROVED":
        return "bg-blue-50 text-blue-700";

      case "INSIDE":
        return "bg-indigo-50 text-indigo-700";

      case "REJECTED":
        return "bg-red-50 text-red-700";

      case "DENIED":
        return "bg-red-50 text-red-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  // --------------------------------------------------
  // PDF EXPORT
  // --------------------------------------------------
  function exportPdf() {
    setError("");
    setExportMessage("");

    if (!items || items.length === 0) {
      setError("Please run a report with data before exporting PDF.");
      return;
    }

    try {
      setPdfExporting(true);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // --------------------------------------------
      // PDF HEADER
      // --------------------------------------------

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("VMS - Visitor Management System", 14, 16);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Architecture Office", 14, 23);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Visitor Visit Report", 14, 33);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(
        `Report Period: ${formatDate(from)} - ${formatDate(to)}`,
        14,
        40
      );

      doc.text(
        `Generated On: ${formatDateTime(new Date())}`,
        14,
        46
      );

      doc.text(
        `Total Visits: ${items.length}`,
        14,
        52
      );

      // --------------------------------------------
      // PDF TABLE
      // --------------------------------------------

      const tableData = items.map((v) => [
        v.visitorPassId || "—",

        v.visitor?.name || "—",

        v.visitor?.mobile || "—",

        v.visitor?.email || "—",

        v.visitor?.organisation || "—",

        v.host?.name || "—",

        v.host?.email || "—",

        v.department?.name || "—",

        v.purpose || "—",

        v.status || "—",

        formatDate(v.visitDate),

        formatDateTime(v.checkInTime),

        formatDateTime(v.checkOutTime),

        getDuration(v.checkInTime, v.checkOutTime),

        v.createdBy?.name ||
          v.createdBy?.email ||
          "—",
      ]);

      autoTable(doc, {
        startY: 58,

        head: [
          [
            "Pass ID",
            "Visitor",
            "Mobile",
            "Email",
            "Organisation",
            "Host / Employee",
            "Host Email",
            "Department",
            "Purpose",
            "Status",
            "Visit Date",
            "Check In",
            "Check Out",
            "Duration",
            "Registered By",
          ],
        ],

        body: tableData,

        theme: "grid",

        styles: {
          fontSize: 6.5,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontSize: 7,
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        margin: {
          top: 58,
          left: 8,
          right: 8,
          bottom: 15,
        },

        didDrawPage: function () {
          const pageHeight = doc.internal.pageSize.height;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");

          doc.text(
            "VMS Architecture Office - Confidential Visitor Report",
            8,
            pageHeight - 8
          );

          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            270,
            pageHeight - 8
          );
        },
      });

      // --------------------------------------------
      // SAVE PDF
      // --------------------------------------------

      doc.save(
        `VMS-Visitor-Report-${from}-to-${to}.pdf`
      );

      setExportMessage(
        "PDF report downloaded successfully."
      );
    } catch (err) {
      console.error("PDF export failed:", err);

      setError(
        "PDF export failed. Please try again."
      );
    } finally {
      setPdfExporting(false);
    }
  }

  // --------------------------------------------------
  // CLEAR
  // --------------------------------------------------
  function clearReport() {
    setFrom("");
    setTo("");
    setItems(null);
    setError("");
    setExportMessage("");
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
  const totalVisits = items?.length || 0;

  const completedVisits =
    items?.filter((v) => v.status === "COMPLETED").length || 0;

  const insideVisits =
    items?.filter((v) => v.status === "INSIDE").length || 0;

  const rejectedVisits =
    items?.filter(
      (v) =>
        v.status === "REJECTED" ||
        v.status === "DENIED"
    ).length || 0;

  return (
    <Layout>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Reports
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Generate detailed visitor reports and export them as PDF or CSV.
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

            {/* RUN */}
            <button
              type="submit"
              disabled={loading || exporting || pdfExporting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition"
            >
              {loading ? "Loading..." : "Run Report"}
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || exporting || pdfExporting}
              className="w-full border border-gray-300 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg px-4 py-2.5 transition"
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {/* ACTIONS */}
          <div className="mt-4 flex flex-wrap items-center gap-4">

            <button
              type="button"
              onClick={clearReport}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>

            {items && items.length > 0 && (
              <button
                type="button"
                onClick={exportPdf}
                disabled={pdfExporting}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition"
              >
                <FileDown size={16} />

                {pdfExporting
                  ? "Generating PDF..."
                  : "Download PDF"}
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {exportMessage && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-700">
                {exportMessage}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            PDF contains complete visitor, host, visit and check-in/check-out details.
          </p>
        </form>

        {/* SUMMARY CARDS */}
        {items !== null && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Total Visits
              </p>

              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {totalVisits}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Completed
              </p>

              <p className="text-2xl font-semibold text-green-600 mt-1">
                {completedVisits}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Currently Inside
              </p>

              <p className="text-2xl font-semibold text-indigo-600 mt-1">
                {insideVisits}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Rejected / Denied
              </p>

              <p className="text-2xl font-semibold text-red-600 mt-1">
                {rejectedVisits}
              </p>
            </div>

          </div>
        )}

        {/* REPORT RESULT */}
        {items !== null && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {/* RESULT HEADER */}
            <div className="px-5 py-4 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

              <div>
                <div className="flex items-center gap-2">

                  <FileText
                    size={18}
                    className="text-brand-600"
                  />

                  <h2 className="text-sm font-semibold text-gray-900">
                    Complete Visitor Visit Report
                  </h2>

                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(from)} to {formatDate(to)}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Total Visits:{" "}
                <span className="font-semibold text-gray-900">
                  {items.length}
                </span>
              </div>

            </div>

            {/* EMPTY */}
            {items.length === 0 ? (
              <div className="px-5 py-12 text-center">

                <FileText
                  size={36}
                  className="mx-auto text-gray-300 mb-3"
                />

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

                <table className="w-full min-w-[1700px] text-sm">

                  <thead>
                    <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-200">

                      <th className="py-3 px-5 font-medium">
                        Pass ID
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Visitor Details
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Host / Employee
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Department
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Purpose
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Status
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Visit Date
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Check In
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Check Out
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Duration
                      </th>

                      <th className="py-3 px-5 font-medium">
                        Registered By
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {items.map((v) => (
                      <tr
                        key={v._id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >

                        {/* PASS */}
                        <td className="py-4 px-5">
                          <span className="font-medium text-gray-700">
                            {v.visitorPassId || "—"}
                          </span>
                        </td>

                        {/* VISITOR */}
                        <td className="py-4 px-5">

                          <div className="font-semibold text-gray-900">
                            {v.visitor?.name || "—"}
                          </div>

                          {v.visitor?.mobile && (
                            <div className="text-xs text-gray-500 mt-1">
                              📞 {v.visitor.mobile}
                            </div>
                          )}

                          {v.visitor?.email && (
                            <div className="text-xs text-gray-500 mt-1">
                              ✉ {v.visitor.email}
                            </div>
                          )}

                          {v.visitor?.organisation && (
                            <div className="text-xs text-gray-400 mt-1">
                              {v.visitor.organisation}
                            </div>
                          )}

                        </td>

                        {/* HOST */}
                        <td className="py-4 px-5">

                          <div className="font-medium text-gray-900">
                            {v.host?.name || "—"}
                          </div>

                          {v.host?.email && (
                            <div className="text-xs text-gray-400 mt-1">
                              {v.host.email}
                            </div>
                          )}

                        </td>

                        {/* DEPARTMENT */}
                        <td className="py-4 px-5 text-gray-700">
                          {v.department?.name || "—"}
                        </td>

                        {/* PURPOSE */}
                        <td className="py-4 px-5 text-gray-700 max-w-[220px]">
                          {v.purpose || "—"}
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-5">

                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              v.status
                            )}`}
                          >
                            {v.status || "—"}
                          </span>

                        </td>

                        {/* VISIT DATE */}
                        <td className="py-4 px-5 text-gray-600 whitespace-nowrap">
                          {formatDate(v.visitDate)}
                        </td>

                        {/* CHECK IN */}
                        <td className="py-4 px-5 whitespace-nowrap">

                          {v.checkInTime ? (
                            <div className="text-green-700">
                              {formatDateTime(v.checkInTime)}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Not checked in
                            </span>
                          )}

                        </td>

                        {/* CHECK OUT */}
                        <td className="py-4 px-5 whitespace-nowrap">

                          {v.checkOutTime ? (
                            <div className="text-red-600">
                              {formatDateTime(v.checkOutTime)}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Not checked out
                            </span>
                          )}

                        </td>

                        {/* DURATION */}
                        <td className="py-4 px-5 whitespace-nowrap">

                          <span className="font-medium text-gray-700">
                            {getDuration(
                              v.checkInTime,
                              v.checkOutTime
                            )}
                          </span>

                        </td>

                        {/* REGISTERED BY */}
                        <td className="py-4 px-5">

                          <div className="font-medium text-gray-900">
                            {v.createdBy?.name ||
                              v.createdBy?.email ||
                              "—"}
                          </div>

                          {v.createdBy?.email &&
                            v.createdBy?.name && (
                              <div className="text-xs text-gray-400 mt-1">
                                {v.createdBy.email}
                              </div>
                            )}

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