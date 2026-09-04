import { useEffect, useState } from "react";
import {
  Users,
  DoorOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Activity,
  Clock3,
  ArrowUpRight,
  Sparkles,
  ClipboardCheck,
  UserPlus,
  LogOut,
  Loader2,
} from "lucide-react";

import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

export default function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  async function loadDashboard(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      }

      const res = await api.get("/reports/dashboard");

      setData(res.data?.data || null);
    } catch (error) {
      console.error("Failed to load receptionist dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (!data) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <Layout>
      <div className="min-h-full bg-slate-50/70">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ================================================== */}
          {/* HERO SECTION */}
          {/* ================================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 shadow-xl sm:p-8">

            {/* Decorative backgrounds */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* Hero content */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Reception Workspace
                </div>

                <div className="flex items-start gap-4">

                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 sm:flex">
                    <Activity className="h-7 w-7 text-white" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Reception Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                      Monitor today's visitor activity, check current
                      occupancy and keep the reception workflow running
                      smoothly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Hero actions */}
              <div className="flex flex-wrap items-center gap-3">

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  System operational
                </div>

                <button
                  type="button"
                  onClick={() => loadDashboard(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}

                  Refresh
                </button>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* OVERVIEW */}
          {/* ================================================== */}

          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Today's overview
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  Visitor Activity
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Clock3 className="h-4 w-4" />
                Live dashboard data
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Visitors Today"
                value={data.visitorsToday}
                description="Total visits registered"
                icon={Users}
                iconClass="bg-indigo-100 text-indigo-600"
                accent="indigo"
              />

              <StatCard
                label="Currently Inside"
                value={data.currentlyInside}
                description="Visitors on premises"
                icon={DoorOpen}
                iconClass="bg-amber-100 text-amber-600"
                accent="amber"
                live
              />

              <StatCard
                label="Completed Today"
                value={data.completedToday}
                description="Visits completed"
                icon={CheckCircle2}
                iconClass="bg-emerald-100 text-emerald-600"
                accent="emerald"
              />

              <StatCard
                label="Rejected / Denied"
                value={data.rejectedOrDenied}
                description="Visits not approved"
                icon={XCircle}
                iconClass="bg-red-100 text-red-600"
                accent="red"
              />

            </div>
          </section>

          {/* ================================================== */}
          {/* MAIN ACTIVITY PANEL */}
          {/* ================================================== */}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Current occupancy */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
                        <DoorOpen className="h-4.5 w-4.5 text-indigo-600" />
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        Current Reception Status
                      </h3>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Quick snapshot of today's visitor flow.
                    </p>
                  </div>

                  <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">

                <ActivityBox
                  icon={Users}
                  label="Total Visitors"
                  value={data.visitorsToday}
                  description="Registered today"
                  iconClass="bg-indigo-100 text-indigo-600"
                />

                <ActivityBox
                  icon={DoorOpen}
                  label="Inside Now"
                  value={data.currentlyInside}
                  description="Active visits"
                  iconClass="bg-amber-100 text-amber-600"
                  live
                />

                <ActivityBox
                  icon={CheckCircle2}
                  label="Completed"
                  value={data.completedToday}
                  description="Finished visits"
                  iconClass="bg-emerald-100 text-emerald-600"
                />

              </div>

              {/* Occupancy bar */}
              <div className="border-t border-slate-100 px-5 py-5 sm:px-6">

                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Today's visitor completion
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    {data.visitorsToday > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (data.completedToday / data.visitorsToday) * 100
                          )
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                    style={{
                      width: `${
                        data.visitorsToday > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (data.completedToday /
                                  data.visitorsToday) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Completion rate based on today's registered visitors.
                </p>

              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Quick Actions
                  </h3>

                  <p className="text-xs text-slate-500">
                    Common reception tasks
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">

                <QuickAction
                  icon={UserPlus}
                  title="Register Visitor"
                  description="Create a new visitor entry"
                  href="/receptionist/visitors/new"
                />

                <QuickAction
                  icon={ClipboardCheck}
                  title="Manage Visitors"
                  description="View today's visitor records"
                  href="/receptionist/visitors"
                />

                <QuickAction
                  icon={LogOut}
                  title="Check-out Visitor"
                  description="Complete an active visit"
                  href="/receptionist/visitors"
                />

              </div>

              <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                  <div>
                    <p className="text-xs font-bold text-indigo-900">
                      Reception tip
                    </p>

                    <p className="mt-1 text-xs leading-5 text-indigo-700">
                      Always verify visitor details before check-in and
                      ensure the host has approved the visit.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* SUMMARY FOOTER */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Reception workspace is operational
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Visitor monitoring and dashboard data are available.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">

                <StatusPill
                  label="Visitors"
                  value={data.visitorsToday}
                  icon={Users}
                />

                <StatusPill
                  label="Inside"
                  value={data.currentlyInside}
                  icon={DoorOpen}
                />

                <StatusPill
                  label="Completed"
                  value={data.completedToday}
                  icon={CheckCircle2}
                />

              </div>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  accent,
  live = false,
}) {
  const accentClasses = {
    indigo: "hover:border-indigo-200",
    amber: "hover:border-amber-200",
    emerald: "hover:border-emerald-200",
    red: "hover:border-red-200",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
        accentClasses[accent] || ""
      }`}
    >
      <div className="relative z-10 flex items-start justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>

            {live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                LIVE
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-slate-100/60 transition duration-500 group-hover:scale-150" />
    </div>
  );
}

// ============================================================
// ACTIVITY BOX
// ============================================================

function ActivityBox({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  live = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        {live && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </span>
        )}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition duration-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
    </a>
  );
}

// ============================================================
// STATUS PILL
// ============================================================

function StatusPill({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

      <Icon className="h-3.5 w-3.5 text-slate-500" />

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}
