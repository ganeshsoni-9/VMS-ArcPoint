import { useEffect, useMemo, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import {
  LogOut,
  LogIn,
  DoorOpen,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  Clock3,
  Building2,
  Phone,
  UserRound,
  ShieldCheck,
  CalendarDays,
  Car,
  Package,
  X,
  AlertTriangle,
  ArrowRight,
  Activity,
  MapPin,
} from "lucide-react";

export default function CurrentlyInside() {
  const [items, setItems] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("inside");

  const [confirmVisit, setConfirmVisit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast, showToast, clearToast } = useToast();

  async function load() {
    setLoading(true);

    try {
      const [insideRes, approvedRes] = await Promise.all([
        api.get("/visits/inside"),
        api.get("/visits", {
          params: {
            status: "APPROVED",
            limit: 20,
          },
        }),
      ]);

      setItems(insideRes.data?.data?.items || []);
      setApproved(approvedRes.data?.data?.items || []);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Failed to load visitor presence data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function checkIn(id) {
    if (!id) return;

    setActionLoading(true);

    try {
      await api.patch(`/visits/${id}/check-in`);

      showToast("Visitor checked in successfully.", "success");

      await load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Check-in failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut(id) {
    if (!id) return;

    setActionLoading(true);

    try {
      const res = await api.patch(`/visits/${id}/check-out`);

      const duration =
        res.data?.data?.durationMinutes;

      showToast(
        duration !== undefined
          ? `Visitor checked out successfully. Duration: ${duration} mins`
          : "Visitor checked out successfully.",
        "success"
      );

      setConfirmVisit(null);

      await load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Check-out failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  }

  const filteredInside = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((v) => {
      const visitorName = v.visitor?.name || "";
      const mobile = v.visitor?.mobile || "";
      const organisation = v.visitor?.organisation || "";
      const host = v.host?.name || "";
      const department = v.department?.name || "";
      const purpose = v.purpose || "";
      const passId = v.visitorPassId || "";
      const vehicle = v.vehicleNumber || "";

      return [
        visitorName,
        mobile,
        organisation,
        host,
        department,
        purpose,
        passId,
        vehicle,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [items, search]);

  const filteredApproved = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return approved;

    return approved.filter((v) => {
      const visitorName = v.visitor?.name || "";
      const mobile = v.visitor?.mobile || "";
      const organisation = v.visitor?.organisation || "";
      const host = v.host?.name || "";
      const passId = v.visitorPassId || "";

      return [
        visitorName,
        mobile,
        organisation,
        host,
        passId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [approved, search]);

  const totalActive = items.length;
  const totalApproved = approved.length;

  const averageDuration = useMemo(() => {
    if (!items.length) return 0;

    const durations = items
      .map((item) => {
        if (!item.checkInTime) return 0;

        const start = new Date(item.checkInTime).getTime();
        const now = Date.now();

        if (Number.isNaN(start)) return 0;

        return Math.max(
          0,
          Math.floor((now - start) / 60000)
        );
      })
      .filter(Boolean);

    if (!durations.length) return 0;

    return Math.round(
      durations.reduce((sum, value) => sum + value, 0) /
        durations.length
    );
  }, [items]);

  return (
    <Layout>
      <div className="space-y-6 pb-8">

        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative px-5 py-7 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">

              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur">
                    <Activity size={13} className="text-emerald-400" />
                    Live Reception Monitoring
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    System Operational
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  Visitor Presence
                  <span className="block text-indigo-300">
                    Control Center
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Monitor approved visitors, manage office entry and
                  exit activity, and maintain a clear real-time view
                  of everyone currently inside the workplace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <ShieldCheck size={15} className="text-emerald-400" />
                    Secure Access
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <MapPin size={15} className="text-indigo-300" />
                    Office Reception
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-slate-200">
                    <Clock3 size={15} className="text-amber-300" />
                    Live Tracking
                  </div>
                </div>
              </div>

              {/* HERO RIGHT */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[390px]">
                <HeroMetric
                  icon={Users}
                  label="Inside"
                  value={totalActive}
                  tone="emerald"
                />

                <HeroMetric
                  icon={CheckCircle2}
                  label="Approved"
                  value={totalApproved}
                  tone="indigo"
                />

                <HeroMetric
                  icon={Clock3}
                  label="Avg. Time"
                  value={`${averageDuration}m`}
                  tone="amber"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TOP CONTROLS
        ========================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reception Operations
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage entry-ready visitors and active guests.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* SEARCH */}
              <div className="relative min-w-0 sm:w-80">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search visitor, host, pass ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* REFRESH */}
              <button
                type="button"
                onClick={load}
                disabled={loading || actionLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* VIEW SWITCHER */}
          <div className="mt-5 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveView("inside")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeView === "inside"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <DoorOpen size={15} />
              Currently Inside
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeView === "inside"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {items.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("approved")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeView === "approved"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckCircle2 size={15} />
              Ready for Check-in
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeView === "approved"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {approved.length}
              </span>
            </button>
          </div>
        </section>

        {/* =========================================================
            APPROVED VISITORS
        ========================================================= */}
        {activeView === "approved" && (
          <section>
            <SectionHeader
              icon={CheckCircle2}
              iconClass="text-indigo-600"
              title="Approved Visitors"
              subtitle="These visitors have been approved and are ready to enter the office."
              count={filteredApproved.length}
              countClass="bg-indigo-100 text-indigo-700"
            />

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
                <LoadingSpinner label="Loading approved visitors..." />
              </div>
            ) : filteredApproved.length === 0 ? (
              <EmptyState
                message={
                  search
                    ? "No approved visitors match your search."
                    : "No approved visitors are currently waiting for check-in."
                }
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <TableHead>Visitor</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Organisation</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Pass ID</TableHead>
                          <TableHead className="text-right">
                            Action
                          </TableHead>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredApproved.map((v) => (
                          <ApprovedRow
                            key={v._id}
                            visit={v}
                            disabled={actionLoading}
                            onCheckIn={checkIn}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MOBILE/TABLET CARDS */}
                <div className="grid gap-4 xl:hidden">
                  {filteredApproved.map((v) => (
                    <ApprovedCard
                      key={v._id}
                      visit={v}
                      disabled={actionLoading}
                      onCheckIn={checkIn}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* =========================================================
            CURRENTLY INSIDE
        ========================================================= */}
        {activeView === "inside" && (
          <section>
            <SectionHeader
              icon={DoorOpen}
              iconClass="text-emerald-600"
              title="Currently Inside Office"
              subtitle="Real-time physical presence monitoring for active visitors."
              count={filteredInside.length}
              countClass="bg-emerald-100 text-emerald-700"
            />

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
                <LoadingSpinner label="Loading active guests inside building..." />
              </div>
            ) : filteredInside.length === 0 ? (
              <EmptyState
                message={
                  search
                    ? "No active visitors match your search."
                    : "No visitors are currently inside the office."
                }
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <TableHead>Visitor</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Organisation</TableHead>
                          <TableHead>Host</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Pass ID</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead className="text-right">
                            Action
                          </TableHead>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredInside.map((v) => (
                          <InsideRow
                            key={v._id}
                            visit={v}
                            onCheckOut={() => setConfirmVisit(v)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MOBILE/TABLET CARDS */}
                <div className="grid gap-4 xl:hidden">
                  {filteredInside.map((v) => (
                    <InsideCard
                      key={v._id}
                      visit={v}
                      onCheckOut={() => setConfirmVisit(v)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* =========================================================
            BOTTOM INFO
        ========================================================= */}
        <section className="grid gap-4 md:grid-cols-3">

          <InfoPanel
            icon={ShieldCheck}
            title="Secure Visitor Flow"
            description="Only approved visitors should be checked into the office."
            tone="indigo"
          />

          <InfoPanel
            icon={Clock3}
            title="Live Presence"
            description="Active visitors remain visible until reception completes check-out."
            tone="emerald"
          />

          <InfoPanel
            icon={AlertTriangle}
            title="Reception Reminder"
            description="Verify the visitor and pass details before completing entry or exit."
            tone="amber"
          />

        </section>
      </div>

      {/* =========================================================
          CHECKOUT MODAL
      ========================================================= */}
      {confirmVisit && (
        <CheckoutModal
          visit={confirmVisit}
          loading={actionLoading}
          onCancel={() => {
            if (!actionLoading) {
              setConfirmVisit(null);
            }
          }}
          onConfirm={() =>
            handleCheckOut(confirmVisit._id)
          }
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          {...toast}
          onClose={clearToast}
        />
      )}
    </Layout>
  );
}

/* ================================================================
   HERO METRIC
================================================================ */

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
  className = "",
}) {
  const tones = {
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      value: "text-emerald-300",
    },
    indigo: {
      icon: "bg-indigo-400/10 text-indigo-300",
      value: "text-indigo-300",
    },
    amber: {
      icon: "bg-amber-400/10 text-amber-300",
      value: "text-amber-300",
    },
  };

  const current = tones[tone] || tones.indigo;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${className}`}
    >
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${current.icon}`}
      >
        <Icon size={17} />
      </div>

      <div
        className={`text-2xl font-black ${current.value}`}
      >
        {value}
      </div>

      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
    </div>
  );
}

/* ================================================================
   SECTION HEADER
================================================================ */

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  count,
  countClass,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={19} className={iconClass} />
        </div>

        <div>
          <h2 className="text-base font-black text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <span
        className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${countClass}`}
      >
        {count} {count === 1 ? "Visitor" : "Visitors"}
      </span>
    </div>
  );
}

/* ================================================================
   TABLE HEAD
================================================================ */

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

/* ================================================================
   APPROVED ROW
================================================================ */

function ApprovedRow({
  visit,
  disabled,
  onCheckIn,
}) {
  return (
    <tr className="group transition hover:bg-indigo-50/30">
      <td className="px-4 py-4">
        <VisitorIdentity visit={visit} />
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Phone size={13} className="text-slate-400" />
          {visit.visitor?.mobile || "N/A"}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Building2 size={13} className="text-slate-400" />
          <span className="max-w-[170px] truncate">
            {visit.visitor?.organisation || "-"}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="text-xs font-bold text-slate-800">
          {visit.host?.name || "N/A"}
        </div>

        {visit.department?.name && (
          <div className="mt-1 text-[10px] text-slate-400">
            {visit.department.name}
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        <PassBadge passId={visit.visitorPassId} />
      </td>

      <td className="px-4 py-4 text-right">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCheckIn(visit._id)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={14} />
          Check In
          <ArrowRight size={13} />
        </button>
      </td>
    </tr>
  );
}

/* ================================================================
   APPROVED CARD
================================================================ */

function ApprovedCard({
  visit,
  disabled,
  onCheckIn,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white p-4">
        <div className="flex items-start justify-between gap-3">
          <VisitorIdentity visit={visit} />

          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-indigo-700">
            Approved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <MobileInfo
          icon={Phone}
          label="Mobile"
          value={visit.visitor?.mobile || "N/A"}
        />

        <MobileInfo
          icon={Building2}
          label="Organisation"
          value={visit.visitor?.organisation || "-"}
        />

        <MobileInfo
          icon={UserRound}
          label="Host"
          value={visit.host?.name || "N/A"}
        />

        <MobileInfo
          icon={CalendarDays}
          label="Visit Date"
          value={formatDate(visit.visitDate)}
        />

        <MobileInfo
          icon={ShieldCheck}
          label="Pass ID"
          value={visit.visitorPassId || "N/A"}
          mono
        />
      </div>

      <div className="border-t border-slate-100 bg-slate-50 p-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onCheckIn(visit._id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={15} />

          {disabled ? "Processing..." : "Check In Visitor"}

          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   INSIDE ROW
================================================================ */

function InsideRow({
  visit,
  onCheckOut,
}) {
  return (
    <tr className="group transition hover:bg-emerald-50/30">
      <td className="px-4 py-4">
        <VisitorIdentity
          visit={visit}
          active
        />
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone size={13} className="text-slate-400" />
          {visit.visitor?.mobile || "N/A"}
        </div>
      </td>

      <td className="px-4 py-4 text-xs text-slate-600">
        {visit.visitor?.organisation || "-"}
      </td>

      <td className="px-4 py-4">
        <div className="text-xs font-bold text-slate-800">
          {visit.host?.name || "N/A"}
        </div>
      </td>

      <td className="px-4 py-4 text-xs text-slate-600">
        {visit.department?.name || "-"}
      </td>

      <td className="max-w-[180px] px-4 py-4">
        <div className="truncate text-xs text-slate-600">
          {visit.purpose || "-"}
        </div>
      </td>

      <td className="px-4 py-4">
        <PassBadge
          passId={visit.visitorPassId}
          active
        />
      </td>

      <td className="px-4 py-4">
        <CheckInTime time={visit.checkInTime} />
      </td>

      <td className="px-4 py-4 text-right">
        <button
          type="button"
          onClick={onCheckOut}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
        >
          <LogOut size={14} />
          Check Out
        </button>
      </td>
    </tr>
  );
}

/* ================================================================
   INSIDE CARD
================================================================ */

function InsideCard({
  visit,
  onCheckOut,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-white p-4">
        <VisitorIdentity
          visit={visit}
          active
        />

        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Inside
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <MobileInfo
          icon={Phone}
          label="Mobile"
          value={visit.visitor?.mobile || "N/A"}
        />

        <MobileInfo
          icon={Building2}
          label="Organisation"
          value={visit.visitor?.organisation || "-"}
        />

        <MobileInfo
          icon={UserRound}
          label="Host"
          value={visit.host?.name || "N/A"}
        />

        <MobileInfo
          icon={Building2}
          label="Department"
          value={visit.department?.name || "-"}
        />

        <MobileInfo
          icon={Clock3}
          label="Check-in"
          value={formatTime(visit.checkInTime)}
        />

        <MobileInfo
          icon={ShieldCheck}
          label="Pass ID"
          value={visit.visitorPassId || "N/A"}
          mono
        />

        {visit.vehicleNumber && (
          <MobileInfo
            icon={Car}
            label="Vehicle"
            value={visit.vehicleNumber}
          />
        )}

        {visit.itemsCarried && (
          <MobileInfo
            icon={Package}
            label="Items"
            value={visit.itemsCarried}
          />
        )}
      </div>

      {/* PURPOSE */}
      {visit.purpose && (
        <div className="mx-4 mb-4 rounded-xl bg-slate-50 p-3">
          <div className="mb-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
            Visit Purpose
          </div>

          <p className="text-xs leading-5 text-slate-700">
            {visit.purpose}
          </p>
        </div>
      )}

      {/* CHECKOUT */}
      <div className="border-t border-slate-100 bg-slate-50 p-4">
        <button
          type="button"
          onClick={onCheckOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
        >
          <LogOut size={15} />
          Check Out Visitor
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   VISITOR IDENTITY
================================================================ */

function VisitorIdentity({
  visit,
  active = false,
}) {
  const name = visit.visitor?.name || "Unknown Visitor";

  return (
    <div className="flex items-center gap-3">
      <VisitorAvatar
        name={name}
        active={active}
      />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-xs font-black text-slate-900">
            {name}
          </div>

          {active && (
            <span className="hidden rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-emerald-700 sm:inline-flex">
              Active
            </span>
          )}
        </div>

        <div className="mt-1 text-[10px] text-slate-400">
          Visitor
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   AVATAR
================================================================ */

function VisitorAvatar({
  name,
  active,
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-indigo-100 text-indigo-700"
      }`}
    >
      {initials || "V"}

      {active && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  );
}

/* ================================================================
   PASS BADGE
================================================================ */

function PassBadge({
  passId,
  active = false,
}) {
  return (
    <div
      className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 ${
        active
          ? "border-emerald-100 bg-emerald-50"
          : "border-indigo-100 bg-indigo-50"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-bold ${
          active
            ? "text-emerald-700"
            : "text-indigo-700"
        }`}
      >
        {passId || "N/A"}
      </span>
    </div>
  );
}

/* ================================================================
   CHECK-IN TIME
================================================================ */

function CheckInTime({ time }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <Clock3 size={13} className="text-emerald-500" />
        {formatTime(time)}
      </div>

      {time && (
        <div className="mt-1 text-[9px] text-slate-400">
          {getDurationText(time)}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   MOBILE INFO
================================================================ */

function MobileInfo({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
        <Icon size={11} />
        {label}
      </div>

      <div
        className={`truncate text-[11px] font-bold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
}

/* ================================================================
   CHECKOUT MODAL
================================================================ */

function CheckoutModal({
  visit,
  loading,
  onCancel,
  onConfirm,
}) {
  const visitorName =
    visit?.visitor?.name || "this visitor";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                <LogOut size={22} />
              </div>

              <h3 className="text-lg font-black">
                Confirm Check-Out
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Complete the visitor exit record.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-3">
              <VisitorAvatar
                name={visitorName}
                active
              />

              <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-900">
                  {visitorName}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    Pass
                  </span>

                  <span className="font-mono text-[10px] font-bold text-emerald-700">
                    {visit?.visitorPassId || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-xs leading-5 text-amber-800">
              Please confirm that{" "}
              <strong>{visitorName}</strong>{" "}
              has left the office. This action will
              complete the current visit.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />
                  Checking Out...
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Confirm Check-Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   INFO PANEL
================================================================ */

function InfoPanel({
  icon: Icon,
  title,
  description,
  tone,
}) {
  const styles = {
    indigo: {
      wrapper: "border-indigo-100 bg-indigo-50/50",
      icon: "bg-indigo-100 text-indigo-600",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50/50",
      icon: "bg-emerald-100 text-emerald-600",
    },
    amber: {
      wrapper: "border-amber-100 bg-amber-50/50",
      icon: "bg-amber-100 text-amber-600",
    },
  };

  const current = styles[tone] || styles.indigo;

  return (
    <div
      className={`rounded-2xl border p-4 ${current.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.icon}`}
        >
          <Icon size={18} />
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DATE / TIME HELPERS
================================================================ */

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationText(value) {
  if (!value) return "";

  const start = new Date(value).getTime();

  if (Number.isNaN(start)) return "";

  const diff = Math.max(
    0,
    Math.floor((Date.now() - start) / 60000)
  );

  if (diff < 1) {
    return "Just now";
  }

  if (diff < 60) {
    return `${diff} min inside`;
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (!minutes) {
    return `${hours}h inside`;
  }

  return `${hours}h ${minutes}m inside`;
}