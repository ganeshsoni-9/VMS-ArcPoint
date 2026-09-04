import { useEffect, useMemo, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import {
  Check,
  X,
  Search,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  Users,
  Building2,
  CalendarDays,
  Phone,
  Car,
  Package,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Filter,
  Inbox,
  FileText,
} from "lucide-react";

export default function Requests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [approvingVisit, setApprovingVisit] = useState(null);
  const [rejectingVisit, setRejectingVisit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [submittingId, setSubmittingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { toast, showToast, clearToast } = useToast();

  // ============================================================
  // LOAD REQUESTS
  // ============================================================

  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/host/requests");

      setItems(res.data?.data?.items || []);
    } catch (err) {
      console.error("Failed to load visitor requests:", err);

      showToast(
        err.response?.data?.message ||
          "Failed to load visitor requests",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // FILTERED REQUESTS
  // ============================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((visit) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        visit.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        visit.visitor?.name,
        visit.visitor?.mobile,
        visit.visitor?.organisation,
        visit.purpose,
        visit.department?.name,
        visit.visitorPassId,
        visit.vehicleNumber,
        visit.itemsCarried,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [items, search, statusFilter]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    return {
      total: items.length,

      pending: items.filter(
        (visit) => visit.status === "PENDING"
      ).length,

      approved: items.filter(
        (visit) => visit.status === "APPROVED"
      ).length,

      rejected: items.filter(
        (visit) => visit.status === "REJECTED"
      ).length,
    };
  }, [items]);

  // ============================================================
  // APPROVE
  // ============================================================

  async function handleApproveSubmit() {
    if (!approvingVisit?._id) {
      return;
    }

    const visitId = approvingVisit._id;

    setSubmittingId(visitId);

    try {
      await api.patch(
        `/host/requests/${visitId}/approve`
      );

      showToast(
        "Visitor request approved successfully.",
        "success"
      );

      setApprovingVisit(null);

      await load();
    } catch (err) {
      console.error("Approve request error:", err);

      showToast(
        err.response?.data?.message ||
          "Failed to approve request",
        "error"
      );
    } finally {
      setSubmittingId(null);
    }
  }

  // ============================================================
  // REJECT
  // ============================================================

  async function handleRejectSubmit(event) {
    event.preventDefault();

    if (!rejectingVisit?._id) {
      return;
    }

    const visitId = rejectingVisit._id;

    setSubmittingId(visitId);

    try {
      await api.patch(
        `/host/requests/${visitId}/reject`,
        {
          reason: rejectionReason.trim(),
        }
      );

      showToast(
        "Visitor request rejected successfully.",
        "success"
      );

      setRejectingVisit(null);
      setRejectionReason("");

      await load();
    } catch (err) {
      console.error("Reject request error:", err);

      showToast(
        err.response?.data?.message ||
          "Failed to reject request",
        "error"
      );
    } finally {
      setSubmittingId(null);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function getInitials(name = "") {
    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (parts.length === 0) {
      return "V";
    }

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusCount(status) {
    switch (status) {
      case "ALL":
        return summary.total;

      case "PENDING":
        return summary.pending;

      case "APPROVED":
        return summary.approved;

      case "REJECTED":
        return summary.rejected;

      default:
        return 0;
    }
  }

  function openRejectModal(visit) {
    setRejectingVisit(visit);
    setRejectionReason("");
  }

  function closeApproveModal() {
    if (!submittingId) {
      setApprovingVisit(null);
    }
  }

  function closeRejectModal() {
    if (!submittingId) {
      setRejectingVisit(null);
      setRejectionReason("");
    }
  }

  return (
    <Layout>
      <div className="min-h-full">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Inbox size={17} />
                </div>

                <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-indigo-600">
                  Visitor Management
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                Visitor Requests
              </h1>

              <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                Review visitor access requests assigned to you,
                verify details, and approve or reject guest access.
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="self-start xl:self-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />

              Refresh Requests
            </button>

          </div>
        </div>

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

          <SummaryCard
            label="Total Requests"
            value={summary.total}
            icon={Inbox}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            accent="from-indigo-500 to-blue-500"
          />

          <SummaryCard
            label="Pending"
            value={summary.pending}
            icon={Clock3}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            accent="from-amber-400 to-orange-500"
          />

          <SummaryCard
            label="Approved"
            value={summary.approved}
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            accent="from-emerald-400 to-green-500"
          />

          <SummaryCard
            label="Rejected"
            value={summary.rejected}
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            accent="from-red-400 to-rose-500"
          />

        </div>

        {/* ======================================================
            MAIN PANEL
        ====================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_12px_40px_-25px_rgba(15,23,42,0.35)] overflow-hidden">

          {/* ====================================================
              TOOLBAR
          ==================================================== */}

          <div className="p-4 sm:p-5 border-b border-slate-100">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

              {/* Search */}

              <div className="relative w-full lg:max-w-md">

                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search visitor, mobile, organisation, pass ID..."
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

              {/* Filter */}

              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mr-1">
                  <Filter size={13} />
                  Filter
                </div>

                <FilterButton
                  active={statusFilter === "ALL"}
                  onClick={() => setStatusFilter("ALL")}
                  label="All"
                  count={getStatusCount("ALL")}
                />

                <FilterButton
                  active={statusFilter === "PENDING"}
                  onClick={() => setStatusFilter("PENDING")}
                  label="Pending"
                  count={getStatusCount("PENDING")}
                  color="amber"
                />

                <FilterButton
                  active={statusFilter === "APPROVED"}
                  onClick={() => setStatusFilter("APPROVED")}
                  label="Approved"
                  count={getStatusCount("APPROVED")}
                  color="green"
                />

                <FilterButton
                  active={statusFilter === "REJECTED"}
                  onClick={() => setStatusFilter("REJECTED")}
                  label="Rejected"
                  count={getStatusCount("REJECTED")}
                  color="red"
                />

              </div>

            </div>

            {/* Result info */}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-4">

              <p className="text-[11px] text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-600">
                  {filteredItems.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-600">
                  {items.length}
                </span>{" "}
                requests
              </p>

              {(search || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </button>
              )}

            </div>

          </div>

          {/* ====================================================
              CONTENT
          ==================================================== */}

          {loading ? (
            <div className="py-16">
              <LoadingSpinner label="Loading visitor requests..." />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 sm:p-10">
              <div className="max-w-md mx-auto">
                <EmptyState
                  message={
                    search || statusFilter !== "ALL"
                      ? "No requests match your current filters."
                      : "No visitor requests found."
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden xl:block overflow-x-auto">

                <table className="w-full text-xs text-left">

                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">

                      <TableHeader>
                        Visitor
                      </TableHeader>

                      <TableHeader>
                        Visit Details
                      </TableHeader>

                      <TableHeader>
                        Department
                      </TableHeader>

                      <TableHeader>
                        Pass
                      </TableHeader>

                      <TableHeader>
                        Vehicle / Items
                      </TableHeader>

                      <TableHeader>
                        Requested
                      </TableHeader>

                      <TableHeader>
                        Status
                      </TableHeader>

                      <TableHeader align="right">
                        Actions
                      </TableHeader>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredItems.map((visit) => (
                      <tr
                        key={visit._id}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >

                        {/* Visitor */}

                        <td className="px-4 py-4 min-w-[220px]">

                          <div className="flex items-center gap-3">

                            <VisitorAvatar
                              name={visit.visitor?.name}
                            />

                            <div className="min-w-0">

                              <p className="font-bold text-slate-900 truncate">
                                {visit.visitor?.name || "N/A"}
                              </p>

                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                                <Phone size={11} />
                                {visit.visitor?.mobile ||
                                  "No mobile"}
                              </div>

                              {visit.visitor?.organisation && (
                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                                  <Building2 size={10} />

                                  <span className="truncate max-w-[150px]">
                                    {visit.visitor.organisation}
                                  </span>
                                </div>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* Visit */}

                        <td className="px-4 py-4 min-w-[180px]">

                          <p className="font-semibold text-slate-800 max-w-[190px] truncate">
                            {visit.purpose || "General Visit"}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
                            <CalendarDays size={11} />
                            {formatDate(visit.visitDate)}
                          </div>

                        </td>

                        {/* Department */}

                        <td className="px-4 py-4">

                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600">
                            <Building2 size={11} />
                            {visit.department?.name || "N/A"}
                          </div>

                        </td>

                        {/* Pass */}

                        <td className="px-4 py-4">

                          <div className="inline-flex items-center gap-2">

                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <ShieldCheck size={13} />
                            </div>

                            <div>
                              <p className="font-mono font-bold text-indigo-600 text-[10px]">
                                {visit.visitorPassId || "N/A"}
                              </p>

                              <p className="text-[9px] text-slate-400 mt-0.5">
                                Visitor Pass
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Vehicle / Items */}

                        <td className="px-4 py-4">

                          <div className="space-y-1.5">

                            {visit.vehicleNumber ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Car size={11} />
                                {visit.vehicleNumber}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-300">
                                No vehicle
                              </div>
                            )}

                            {visit.itemsCarried ? (
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 max-w-[130px]">
                                <Package size={11} />

                                <span className="truncate">
                                  {visit.itemsCarried}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-300">
                                No items
                              </div>
                            )}

                          </div>

                        </td>

                        {/* Requested */}

                        <td className="px-4 py-4">

                          <p className="font-semibold text-slate-600 text-[10px]">
                            {formatDate(visit.createdAt)}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatTime(visit.createdAt)}
                          </p>

                        </td>

                        {/* Status */}

                        <td className="px-4 py-4">
                          <StatusBadge status={visit.status} />
                        </td>

                        {/* Actions */}

                        <td className="px-4 py-4 text-right">

                          {visit.status === "PENDING" ? (
                            <div className="inline-flex items-center gap-1.5">

                              <button
                                type="button"
                                disabled={
                                  submittingId === visit._id
                                }
                                onClick={() =>
                                  setApprovingVisit(visit)
                                }
                                title="Approve request"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm transition-all disabled:opacity-50"
                              >
                                <Check size={13} />
                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={
                                  submittingId === visit._id
                                }
                                onClick={() =>
                                  openRejectModal(visit)
                                }
                                title="Reject request"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 text-[10px] font-bold transition-all disabled:opacity-50"
                              >
                                <X size={13} />
                                Reject
                              </button>

                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                              <CheckCircle2 size={12} />
                              Responded
                            </span>
                          )}

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
                  TABLET
              ================================================== */}

              <div className="hidden md:block xl:hidden overflow-x-auto">

                <table className="w-full text-xs text-left">

                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <TableHeader>Visitor</TableHeader>
                      <TableHeader>Purpose</TableHeader>
                      <TableHeader>Visit</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader align="right">
                        Actions
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredItems.map((visit) => (
                      <tr
                        key={visit._id}
                        className="hover:bg-slate-50 transition-colors"
                      >

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3">

                            <VisitorAvatar
                              name={visit.visitor?.name}
                              small
                            />

                            <div>
                              <p className="font-bold text-slate-900">
                                {visit.visitor?.name || "N/A"}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-1">
                                {visit.visitor?.mobile || "-"}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <p className="font-semibold text-slate-700 max-w-[180px] truncate">
                            {visit.purpose || "General Visit"}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1">
                            {visit.department?.name ||
                              "No department"}
                          </p>

                        </td>

                        <td className="px-4 py-4">

                          <p className="font-semibold text-slate-600">
                            {formatDate(visit.visitDate)}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatTime(visit.createdAt)}
                          </p>

                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={visit.status} />
                        </td>

                        <td className="px-4 py-4 text-right">

                          {visit.status === "PENDING" ? (
                            <div className="inline-flex gap-1.5">

                              <button
                                type="button"
                                disabled={
                                  submittingId === visit._id
                                }
                                onClick={() =>
                                  setApprovingVisit(visit)
                                }
                                className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  submittingId === visit._id
                                }
                                onClick={() =>
                                  openRejectModal(visit)
                                }
                                className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-100 disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={14} />
                              </button>

                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              Responded
                            </span>
                          )}

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* ==================================================
                  MOBILE CARDS
              ================================================== */}

              <div className="md:hidden divide-y divide-slate-100">

                {filteredItems.map((visit) => (
                  <MobileRequestCard
                    key={visit._id}
                    visit={visit}
                    submittingId={submittingId}
                    onApprove={() =>
                      setApprovingVisit(visit)
                    }
                    onReject={() =>
                      openRejectModal(visit)
                    }
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}

              </div>
            </>
          )}

          {/* ====================================================
              FOOTER
          ==================================================== */}

          {!loading && filteredItems.length > 0 && (
            <div className="px-4 sm:px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">

              <div className="flex flex-wrap items-center justify-between gap-2">

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Users size={13} />

                  <span>
                    {filteredItems.length} visitor request
                    {filteredItems.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">

                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {summary.pending} pending
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {summary.approved} approved
                  </span>

                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {summary.rejected} rejected
                  </span>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* ========================================================
          APPROVAL MODAL
      ======================================================== */}

      {approvingVisit && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApproveModal();
            }
          }}
        >

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">

            <div className="relative bg-gradient-to-br from-emerald-600 to-green-700 px-6 py-7 text-white">

              <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />

              <div className="relative">

                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
                  <CheckCircle2 size={27} />
                </div>

                <h3 className="text-xl font-bold">
                  Approve Visitor?
                </h3>

                <p className="text-xs text-emerald-50 mt-1.5">
                  Confirm access approval for this visitor request.
                </p>

              </div>

            </div>

            <div className="p-6">

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">

                <VisitorAvatar
                  name={approvingVisit.visitor?.name}
                />

                <div className="min-w-0">

                  <p className="font-bold text-slate-900">
                    {approvingVisit.visitor?.name ||
                      "Visitor"}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {approvingVisit.visitor?.mobile ||
                      "No mobile number"}
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6">

                <InfoMini
                  icon={<CalendarDays size={13} />}
                  label="Visit Date"
                  value={formatDate(
                    approvingVisit.visitDate
                  )}
                />

                <InfoMini
                  icon={<Clock3 size={13} />}
                  label="Requested"
                  value={formatTime(
                    approvingVisit.createdAt
                  )}
                />

                <InfoMini
                  icon={<Building2 size={13} />}
                  label="Department"
                  value={
                    approvingVisit.department?.name ||
                    "N/A"
                  }
                />

                <InfoMini
                  icon={<FileText size={13} />}
                  label="Purpose"
                  value={
                    approvingVisit.purpose || "General"
                  }
                />

              </div>

              <div className="flex gap-2.5">

                <button
                  type="button"
                  disabled={
                    submittingId === approvingVisit._id
                  }
                  onClick={closeApproveModal}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    submittingId === approvingVisit._id
                  }
                  onClick={handleApproveSubmit}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submittingId === approvingVisit._id ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Confirm Approval
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          REJECTION MODAL
      ======================================================== */}

      {rejectingVisit && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectModal();
            }
          }}
        >

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">

            <div className="relative bg-gradient-to-br from-red-600 to-rose-700 px-6 py-7 text-white">

              <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />

              <div className="relative flex items-start justify-between">

                <div>

                  <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
                    <AlertTriangle size={27} />
                  </div>

                  <h3 className="text-xl font-bold">
                    Reject Visitor Request
                  </h3>

                  <p className="text-xs text-red-50 mt-1.5">
                    Please confirm the rejection details below.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={
                    submittingId === rejectingVisit._id
                  }
                  onClick={closeRejectModal}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  aria-label="Close rejection modal"
                >
                  <X size={17} />
                </button>

              </div>

            </div>

            <form
              onSubmit={handleRejectSubmit}
              className="p-6"
            >

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">

                <VisitorAvatar
                  name={rejectingVisit.visitor?.name}
                />

                <div className="min-w-0">

                  <p className="font-bold text-slate-900">
                    {rejectingVisit.visitor?.name ||
                      "Visitor"}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {rejectingVisit.purpose ||
                      "General visit"}
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100 mb-5">

                <AlertTriangle
                  size={15}
                  className="text-amber-600 shrink-0 mt-0.5"
                />

                <p className="text-[11px] leading-5 text-amber-800">
                  Rejecting this request will deny the
                  visitor access for this visit.
                </p>

              </div>

              <div className="mb-5">

                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Reason for Rejection

                  <span className="font-normal text-slate-400 ml-1">
                    (Optional)
                  </span>
                </label>

                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder="Provide a reason for the visitor..."
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value
                    )
                  }
                  className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all"
                />

                <div className="flex justify-end mt-1">
                  <span className="text-[9px] text-slate-400">
                    {rejectionReason.length}/500
                  </span>
                </div>

              </div>

              <div className="flex gap-2.5">

                <button
                  type="button"
                  disabled={
                    submittingId === rejectingVisit._id
                  }
                  onClick={closeRejectModal}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingId === rejectingVisit._id
                  }
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {submittingId === rejectingVisit._id ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X size={15} />
                      Confirm Rejection
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================
          TOAST
      ======================================================== */}

      {toast && (
        <Toast
          {...toast}
          onClose={clearToast}
        />
      )}

    </Layout>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}) {
  return (
    <div className="relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent}`}
      />

      <div className="flex items-center justify-between gap-3">

        <div>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400">
            {label}
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">
            {value}
          </p>
        </div>

        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}
        >
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
}

// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({
  active,
  onClick,
  label,
  count,
  color = "indigo",
}) {
  const activeClasses = {
    indigo:
      "bg-indigo-600 text-white border-indigo-600 shadow-sm",

    amber:
      "bg-amber-500 text-white border-amber-500 shadow-sm",

    green:
      "bg-emerald-600 text-white border-emerald-600 shadow-sm",

    red:
      "bg-red-600 text-white border-red-600 shadow-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
        active
          ? activeClasses[color]
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {label}

      <span
        className={`min-w-[18px] h-[18px] px-1 rounded-md flex items-center justify-center text-[9px] ${
          active
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================
// TABLE HEADER
// ============================================================

function TableHeader({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// ============================================================
// VISITOR AVATAR
// ============================================================

function VisitorAvatar({
  name = "",
  small = false,
}) {
  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean);

  const initials =
    parts.length > 1
      ? `${parts[0]?.[0] || ""}${
          parts[parts.length - 1]?.[0] || ""
        }`
      : parts[0]?.[0] || "V";

  return (
    <div
      className={`shrink-0 ${
        small
          ? "w-9 h-9 rounded-xl"
          : "w-11 h-11 rounded-xl"
      } bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold ${
        small ? "text-[10px]" : "text-xs"
      } border border-indigo-200`}
    >
      {initials.toUpperCase()}
    </div>
  );
}

// ============================================================
// MINI INFO
// ============================================================

function InfoMini({
  icon,
  label,
  value,
}) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-0">

      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}

        <span className="text-[9px] uppercase tracking-wider font-bold">
          {label}
        </span>
      </div>

      <p className="text-[10px] font-bold text-slate-700 truncate">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// MOBILE REQUEST CARD
// ============================================================

function MobileRequestCard({
  visit,
  submittingId,
  onApprove,
  onReject,
  formatDate,
  formatTime,
}) {
  const visitorName =
    visit.visitor?.name || "Unknown Visitor";

  return (
    <div className="p-4">

      {/* Top */}

      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">

          <VisitorAvatar name={visitorName} />

          <div className="min-w-0">

            <p className="font-bold text-sm text-slate-900 truncate">
              {visitorName}
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {visit.visitor?.mobile ||
                "No mobile number"}
            </p>

          </div>

        </div>

        <StatusBadge status={visit.status} />

      </div>

      {/* Details */}

      <div className="grid grid-cols-2 gap-2 mt-4">

        <MobileDetail
          icon={<FileText size={12} />}
          label="Purpose"
          value={
            visit.purpose || "General visit"
          }
        />

        <MobileDetail
          icon={<CalendarDays size={12} />}
          label="Visit Date"
          value={formatDate(visit.visitDate)}
        />

        <MobileDetail
          icon={<Building2 size={12} />}
          label="Department"
          value={
            visit.department?.name || "N/A"
          }
        />

        <MobileDetail
          icon={<ShieldCheck size={12} />}
          label="Pass ID"
          value={
            visit.visitorPassId || "N/A"
          }
        />

      </div>

      {/* Extra */}

      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-slate-400">

        {visit.visitor?.organisation && (
          <span className="flex items-center gap-1">
            <Building2 size={11} />
            {visit.visitor.organisation}
          </span>
        )}

        {visit.vehicleNumber && (
          <span className="flex items-center gap-1">
            <Car size={11} />
            {visit.vehicleNumber}
          </span>
        )}

        <span className="flex items-center gap-1">
          <Clock3 size={11} />
          Requested {formatTime(visit.createdAt)}
        </span>

      </div>

      {/* Actions */}

      {visit.status === "PENDING" ? (
        <div className="grid grid-cols-2 gap-2 mt-4">

          <button
            type="button"
            disabled={submittingId === visit._id}
            onClick={onApprove}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check size={14} />
            Approve
          </button>

          <button
            type="button"
            disabled={submittingId === visit._id}
            onClick={onReject}
            className="h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[11px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <X size={14} />
            Reject
          </button>

        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-[10px] font-semibold text-slate-400">
          <CheckCircle2 size={13} />
          Request already responded
          <ChevronRight size={12} />
        </div>
      )}

    </div>
  );
}

// ============================================================
// MOBILE DETAIL
// ============================================================

function MobileDetail({
  icon,
  label,
  value,
}) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 min-w-0">

      <div className="flex items-center gap-1.5 text-slate-400 mb-1">

        {icon}

        <span className="text-[8px] uppercase tracking-wider font-bold">
          {label}
        </span>

      </div>

      <p className="text-[10px] font-bold text-slate-700 truncate">
        {value}
      </p>

    </div>
  );
}

