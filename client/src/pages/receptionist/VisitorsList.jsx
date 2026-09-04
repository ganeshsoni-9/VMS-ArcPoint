import { useEffect, useMemo, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import {
  Search,
  LogIn,
  LogOut,
  Users,
  UserRound,
  Phone,
  Building2,
  BriefcaseBusiness,
  Hash,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  UserCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Timer,
  Inbox,
  AlertTriangle,
  Eye,
} from "lucide-react";

export default function VisitorsList() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast, showToast, clearToast } = useToast();

  /* ================================================================
     LOAD VISITS
  ================================================================= */

  async function loadVisits() {
    setLoading(true);

    try {
      const res = await api.get("/visits", {
        params: {
          search,
          page,
          limit: 10,
        },
      });

      setItems(res.data?.data?.items || []);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to load visitor logs",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVisits();
  }, [page]);

  /* ================================================================
     SEARCH
  ================================================================= */

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;

    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const visitorName =
        item.visitor?.name?.toLowerCase() || "";

      const visitorMobile =
        item.visitor?.mobile?.toLowerCase() || "";

      const organisation =
        item.visitor?.organisation?.toLowerCase() || "";

      const passId =
        item.visitorPassId?.toLowerCase() || "";

      const hostName =
        item.host?.name?.toLowerCase() || "";

      const purpose =
        item.purpose?.toLowerCase() || "";

      return (
        visitorName.includes(q) ||
        visitorMobile.includes(q) ||
        organisation.includes(q) ||
        passId.includes(q) ||
        hostName.includes(q) ||
        purpose.includes(q)
      );
    });
  }, [items, search]);

  /* ================================================================
     STATS
  ================================================================= */

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter(
        (item) => item.status === "PENDING"
      ).length,

      approved: items.filter(
        (item) => item.status === "APPROVED"
      ).length,

      inside: items.filter(
        (item) => item.status === "INSIDE"
      ).length,

      completed: items.filter(
        (item) => item.status === "COMPLETED"
      ).length,

      rejected: items.filter(
        (item) => item.status === "REJECTED"
      ).length,
    };
  }, [items]);

  /* ================================================================
     CHECK IN
  ================================================================= */

  async function handleCheckIn(visitId) {
    if (!visitId) return;

    setActionLoading(true);

    try {
      await api.patch(`/visits/${visitId}/check-in`);

      showToast(
        "Visitor checked in successfully.",
        "success"
      );

      setConfirmAction(null);

      await loadVisits();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Check-in failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* ================================================================
     CHECK OUT
  ================================================================= */

  async function handleCheckOut(visitId) {
    if (!visitId) return;

    setActionLoading(true);

    try {
      await api.patch(`/visits/${visitId}/check-out`);

      showToast(
        "Visitor checked out successfully.",
        "success"
      );

      setConfirmAction(null);

      await loadVisits();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Check-out failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* ================================================================
     DATE HELPERS
  ================================================================= */

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* ================================================================
     UI
  ================================================================= */

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ======================================================
              HERO
          ======================================================= */}

          <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-cyan-500/10" />

            <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-indigo-300" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Reception Workspace
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                        Live Visitor Log
                      </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Visitors Log
                    </h1>

                    <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
                      Monitor visitor requests, approvals, check-ins and
                      check-outs from one secure workspace.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadVisits}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>
              </div>

              {/* ==================================================
                  HERO STATS
              =================================================== */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                <HeroStat
                  label="Total"
                  value={stats.total}
                  icon={Users}
                />

                <HeroStat
                  label="Pending"
                  value={stats.pending}
                  icon={Clock3}
                />

                <HeroStat
                  label="Inside"
                  value={stats.inside}
                  icon={LogIn}
                />

                <HeroStat
                  label="Completed"
                  value={stats.completed}
                  icon={CheckCircle2}
                />
              </div>
            </div>
          </section>

          {/* ======================================================
              SEARCH / FILTER BAR
          ======================================================= */}

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">

              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search visitor, mobile, organisation, host, purpose or pass ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Inbox className="w-4 h-4" />

                <span>
                  Showing{" "}
                  <strong className="text-slate-900">
                    {filteredItems.length}
                  </strong>{" "}
                  visitor{filteredItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================
              QUICK STATUS SUMMARY
          ======================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MiniStatus
              label="All"
              value={stats.total}
              icon={Users}
            />

            <MiniStatus
              label="Pending"
              value={stats.pending}
              icon={Clock3}
              tone="amber"
            />

            <MiniStatus
              label="Approved"
              value={stats.approved}
              icon={CheckCircle2}
              tone="indigo"
            />

            <MiniStatus
              label="Inside"
              value={stats.inside}
              icon={LogIn}
              tone="emerald"
            />

            <MiniStatus
              label="Completed"
              value={stats.completed}
              icon={CheckCircle2}
              tone="slate"
            />

            <MiniStatus
              label="Rejected"
              value={stats.rejected}
              icon={XCircle}
              tone="red"
            />
          </div>

          {/* ======================================================
              CONTENT
          ======================================================= */}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
              <LoadingSpinner label="Loading visitor logs..." />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <EmptyState
                message={
                  search
                    ? "No visitors match your search."
                    : "No visitors found."
                }
              />
            </div>
          ) : (
            <>
              {/* ==================================================
                  DESKTOP TABLE
              =================================================== */}

              <section className="hidden lg:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Visitor Records
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Manage visitor movement and current access status.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Secure reception log
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">

                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <TableHeader>Visitor</TableHeader>
                        <TableHeader>Contact</TableHeader>
                        <TableHeader>Host</TableHeader>
                        <TableHeader>Visit</TableHeader>
                        <TableHeader>Pass ID</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader align="right">
                          Action
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredItems.map((visit) => (
                        <VisitorTableRow
                          key={visit._id}
                          visit={visit}
                          onAction={setConfirmAction}
                          formatDate={formatDate}
                          formatTime={formatTime}
                        />
                      ))}

                    </tbody>
                  </table>
                </div>
              </section>

              {/* ==================================================
                  TABLET
              =================================================== */}

              <section className="hidden md:block lg:hidden bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">
                    Visitor Records
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Swipe horizontally to view complete details.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[950px] w-full text-sm text-left">

                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <TableHeader>Visitor</TableHeader>
                        <TableHeader>Mobile</TableHeader>
                        <TableHeader>Organisation</TableHeader>
                        <TableHeader>Host</TableHeader>
                        <TableHeader>Pass ID</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader align="right">
                          Action
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((visit) => (
                        <VisitorTabletRow
                          key={visit._id}
                          visit={visit}
                          onAction={setConfirmAction}
                        />
                      ))}
                    </tbody>

                  </table>
                </div>
              </section>

              {/* ==================================================
                  MOBILE CARDS
              =================================================== */}

              <section className="md:hidden space-y-4">

                {filteredItems.map((visit) => (
                  <MobileVisitorCard
                    key={visit._id}
                    visit={visit}
                    onAction={setConfirmAction}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))}

              </section>

              {/* ==================================================
                  PAGINATION
              =================================================== */}

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                  <div className="text-xs text-slate-500">
                    Page{" "}
                    <strong className="text-slate-900">
                      {page}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-slate-900">
                      {totalPages}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="min-w-10 h-9 px-3 rounded-xl bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
                      {page}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages || loading}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================
          CONFIRMATION MODAL
      ============================================================= */}

      {confirmAction && (
        <ConfirmationModal
          action={confirmAction}
          loading={actionLoading}
          onClose={() => {
            if (!actionLoading) {
              setConfirmAction(null);
            }
          }}
          onConfirm={() => {
            const visitId = confirmAction.visit?._id;

            if (confirmAction.type === "checkIn") {
              handleCheckIn(visitId);
            } else {
              handleCheckOut(visitId);
            }
          }}
        />
      )}

      {toast && (
        <Toast
          {...toast}
          onClose={clearToast}
        />
      )}
    </Layout>
  );
}

/* =================================================================
   HERO STAT
================================================================= */

function HeroStat({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          {label}
        </span>

        <Icon className="w-4 h-4 text-indigo-300" />
      </div>

      <p className="text-2xl font-black mt-2">
        {value}
      </p>
    </div>
  );
}

/* =================================================================
   MINI STATUS
================================================================= */

function MiniStatus({
  label,
  value,
  icon: Icon,
  tone = "default",
}) {
  const tones = {
    default: {
      box: "bg-slate-50 border-slate-200",
      icon: "bg-white text-slate-600",
    },

    amber: {
      box: "bg-amber-50 border-amber-100",
      icon: "bg-white text-amber-600",
    },

    indigo: {
      box: "bg-indigo-50 border-indigo-100",
      icon: "bg-white text-indigo-600",
    },

    emerald: {
      box: "bg-emerald-50 border-emerald-100",
      icon: "bg-white text-emerald-600",
    },

    slate: {
      box: "bg-slate-100 border-slate-200",
      icon: "bg-white text-slate-600",
    },

    red: {
      box: "bg-red-50 border-red-100",
      icon: "bg-white text-red-600",
    },
  };

  const current = tones[tone] || tones.default;

  return (
    <div
      className={`rounded-2xl border p-4 ${current.box}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${current.icon}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <span className="text-lg font-black text-slate-900">
          {value}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-500 mt-3">
        {label}
      </p>
    </div>
  );
}

/* =================================================================
   TABLE HEADER
================================================================= */

function TableHeader({
  children,
  align = "left",
}) {
  return (
    <th
      className={`px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-slate-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* =================================================================
   DESKTOP TABLE ROW
================================================================= */

function VisitorTableRow({
  visit,
  onAction,
  formatDate,
  formatTime,
}) {
  const visitor = visit.visitor || {};

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">

      {/* Visitor */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">

          <VisitorAvatar name={visitor.name} />

          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate max-w-[170px]">
              {visitor.name || "N/A"}
            </p>

            <p className="text-xs text-slate-400 truncate max-w-[190px] mt-0.5">
              {visit.purpose || "No purpose provided"}
            </p>
          </div>

        </div>
      </td>

      {/* Contact */}
      <td className="px-5 py-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {visitor.mobile || "N/A"}
          </div>

          {visitor.organisation && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[150px] truncate">
                {visitor.organisation}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Host */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800">
              {visit.host?.name || "N/A"}
            </p>

            <p className="text-[11px] text-slate-400">
              Host Employee
            </p>
          </div>
        </div>
      </td>

      {/* Visit */}
      <td className="px-5 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(visit.visitDate)}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock3 className="w-3.5 h-3.5" />
            {formatTime(visit.createdAt)}
          </div>
        </div>
      </td>

      {/* Pass ID */}
      <td className="px-5 py-4">
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-2">
          <Hash className="w-3.5 h-3.5 text-slate-400" />

          <span className="font-mono text-[11px] font-bold text-slate-700">
            {visit.visitorPassId || "N/A"}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={visit.status} />
      </td>

      {/* Action */}
      <td className="px-5 py-4 text-right">
        <ActionButton
          visit={visit}
          onAction={onAction}
        />
      </td>
    </tr>
  );
}

/* =================================================================
   TABLET ROW
================================================================= */

function VisitorTabletRow({
  visit,
  onAction,
}) {
  const visitor = visit.visitor || {};

  return (
    <tr className="hover:bg-slate-50 transition-colors">

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <VisitorAvatar name={visitor.name} />

          <div>
            <p className="font-bold text-slate-900">
              {visitor.name || "N/A"}
            </p>

            <p className="text-xs text-slate-400">
              {visit.purpose || "No purpose"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-xs text-slate-600">
        {visitor.mobile || "N/A"}
      </td>

      <td className="px-4 py-4 text-xs text-slate-600">
        {visitor.organisation || "—"}
      </td>

      <td className="px-4 py-4 text-xs font-semibold text-slate-700">
        {visit.host?.name || "N/A"}
      </td>

      <td className="px-4 py-4">
        <span className="font-mono text-[11px] font-bold text-slate-600">
          {visit.visitorPassId || "N/A"}
        </span>
      </td>

      <td className="px-4 py-4">
        <StatusBadge status={visit.status} />
      </td>

      <td className="px-4 py-4 text-right">
        <ActionButton
          visit={visit}
          onAction={onAction}
        />
      </td>
    </tr>
  );
}

/* =================================================================
   MOBILE CARD
================================================================= */

function MobileVisitorCard({
  visit,
  onAction,
  formatDate,
  formatTime,
}) {
  const visitor = visit.visitor || {};

  return (
    <article className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

      {/* Top */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">
            <VisitorAvatar name={visitor.name} size="large" />

            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 truncate">
                {visitor.name || "N/A"}
              </h3>

              <p className="text-xs text-slate-400 mt-1 truncate">
                {visitor.organisation || "Individual Visitor"}
              </p>
            </div>
          </div>

          <StatusBadge status={visit.status} />
        </div>

        {/* Purpose */}
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <BriefcaseBusiness className="w-4 h-4 text-indigo-600" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Purpose
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-1">
                {visit.purpose || "No purpose provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mt-4">

          <MobileInfo
            icon={Phone}
            label="Mobile"
            value={visitor.mobile || "N/A"}
          />

          <MobileInfo
            icon={UserCheck}
            label="Host"
            value={visit.host?.name || "N/A"}
          />

          <MobileInfo
            icon={CalendarDays}
            label="Visit Date"
            value={formatDate(visit.visitDate)}
          />

          <MobileInfo
            icon={Clock3}
            label="Created"
            value={formatTime(visit.createdAt)}
          />

        </div>

        {/* Pass */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />

            <span className="text-xs font-semibold text-slate-500">
              Pass ID
            </span>
          </div>

          <span className="font-mono text-xs font-bold text-slate-800">
            {visit.visitorPassId || "N/A"}
          </span>
        </div>

        {/* Action */}
        <div className="mt-4">
          <ActionButton
            visit={visit}
            onAction={onAction}
            fullWidth
          />
        </div>

      </div>
    </article>
  );
}

/* =================================================================
   MOBILE INFO
================================================================= */

function MobileInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>

      <p className="text-xs font-bold text-slate-700 mt-2 truncate">
        {value}
      </p>
    </div>
  );
}

/* =================================================================
   ACTION BUTTON
================================================================= */

function ActionButton({
  visit,
  onAction,
  fullWidth = false,
}) {
  if (visit.status === "APPROVED") {
    return (
      <button
        type="button"
        onClick={() =>
          onAction({
            type: "checkIn",
            visit,
          })
        }
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-indigo-600/20 transition ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <LogIn className="w-4 h-4" />
        Check In
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  if (visit.status === "INSIDE") {
    return (
      <button
        type="button"
        onClick={() =>
          onAction({
            type: "checkOut",
            visit,
          })
        }
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-emerald-600/20 transition ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <LogOut className="w-4 h-4" />
        Check Out
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    );
  }

  if (visit.status === "PENDING") {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <Clock3 className="w-3.5 h-3.5" />
        Waiting Approval
      </span>
    );
  }

  if (visit.status === "COMPLETED") {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }

  if (visit.status === "REJECTED") {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <XCircle className="w-3.5 h-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <Eye className="w-3.5 h-3.5" />
      {visit.status || "Unknown"}
    </span>
  );
}

/* =================================================================
   VISITOR AVATAR
================================================================= */

function VisitorAvatar({
  name,
  size = "normal",
}) {
  const firstLetter =
    name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 shrink-0 ${
        size === "large"
          ? "w-12 h-12 text-base"
          : "w-10 h-10 text-sm"
      }`}
    >
      {firstLetter}
    </div>
  );
}

/* =================================================================
   CONFIRMATION MODAL
================================================================= */

function ConfirmationModal({
  action,
  loading,
  onClose,
  onConfirm,
}) {
  const isCheckIn = action.type === "checkIn";

  const visitorName =
    action.visit?.visitor?.name || "this visitor";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">

      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div
          className={`p-6 ${
            isCheckIn
              ? "bg-indigo-50"
              : "bg-emerald-50"
          }`}
        >
          <div className="flex items-start gap-4">

            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isCheckIn
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {isCheckIn ? (
                <LogIn className="w-6 h-6" />
              ) : (
                <LogOut className="w-6 h-6" />
              )}
            </div>

            <div>
              <p
                className={`text-xs uppercase tracking-widest font-bold ${
                  isCheckIn
                    ? "text-indigo-600"
                    : "text-emerald-600"
                }`}
              >
                Visitor Movement
              </p>

              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {isCheckIn
                  ? "Confirm Check-In"
                  : "Confirm Check-Out"}
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-3">
              <VisitorAvatar
                name={visitorName}
                size="large"
              />

              <div>
                <p className="font-bold text-slate-900">
                  {visitorName}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Pass ID:{" "}
                  <span className="font-mono font-semibold text-slate-700">
                    {action.visit?.visitorPassId || "N/A"}
                  </span>
                </p>
              </div>
            </div>

          </div>

          <div className="flex items-start gap-3 mt-5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

            <p className="text-sm text-slate-600 leading-6">
              {isCheckIn
                ? `Confirm that ${visitorName} has entered the office and should now be marked as inside.`
                : `Confirm that ${visitorName} has left the office and should now be marked as checked out.`}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-7">

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 disabled:opacity-50 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition ${
                isCheckIn
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isCheckIn ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}

                  {isCheckIn
                    ? "Confirm Check-In"
                    : "Confirm Check-Out"}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
