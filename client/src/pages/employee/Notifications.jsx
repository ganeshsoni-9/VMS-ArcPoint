import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Inbox,
  Filter,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  async function load(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await api.get("/notifications");

      setItems(res.data?.data?.items || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ============================================================
  // MARK SINGLE NOTIFICATION AS READ
  // ============================================================

  async function markRead(id) {
    try {
      setMarkingId(id);

      await api.patch(`/notifications/${id}/read`);

      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingId(null);
    }
  }

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  async function markAllRead() {
    try {
      setMarkingAll(true);

      await api.patch("/notifications/read-all");

      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  }

  // ============================================================
  // STATS
  // ============================================================

  const totalCount = items.length;

  const unreadCount = items.filter((item) => !item.isRead).length;

  const readCount = items.filter((item) => item.isRead).length;

  // ============================================================
  // FILTER + SEARCH
  // ============================================================

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "unread"
          ? !item.isRead
          : item.isRead;

      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [items, search, filter]);

  // ============================================================
  // DATE FORMAT
  // ============================================================

  function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateTime(dateValue) {
    return `${formatDate(dateValue)} • ${formatTime(dateValue)}`;
  }

  // ============================================================
  // NOTIFICATION TYPE
  // ============================================================

  function getNotificationStyle(notification) {
    const text = `${notification?.title || ""} ${
      notification?.message || ""
    }`.toLowerCase();

    if (
      text.includes("approved") ||
      text.includes("success") ||
      text.includes("welcome")
    ) {
      return {
        icon: CheckCheck,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        badge: "Success",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (
      text.includes("rejected") ||
      text.includes("declined") ||
      text.includes("failed")
    ) {
      return {
        icon: X,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        badge: "Action required",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (
      text.includes("visitor") ||
      text.includes("request") ||
      text.includes("check-in") ||
      text.includes("check in")
    ) {
      return {
        icon: BellRing,
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        badge: "Visitor update",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    }

    return {
      icon: Bell,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      badge: "Notification",
      badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    };
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <Layout>
      <div className="min-h-full bg-slate-50/70">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ================================================== */}
          {/* HERO */}
          {/* ================================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 shadow-xl sm:p-8">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure notification center
                </div>

                <div className="flex items-start gap-4">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 sm:flex">
                    <BellRing className="h-7 w-7 text-white" />
                  </div>

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Notifications
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                      Stay updated with visitor requests, approvals,
                      check-ins and important activity across ArcPoint VMS.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={markingAll || unreadCount === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {markingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}

                  Mark all as read
                </button>
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* STATS */}
          {/* ================================================== */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NotificationStat
              icon={Inbox}
              label="Total notifications"
              value={totalCount}
              description="All received updates"
              iconClass="bg-indigo-100 text-indigo-600"
            />

            <NotificationStat
              icon={BellRing}
              label="Unread"
              value={unreadCount}
              description={
                unreadCount === 0
                  ? "You're all caught up"
                  : "Need your attention"
              }
              iconClass="bg-amber-100 text-amber-600"
              active={unreadCount > 0}
            />

            <NotificationStat
              icon={CheckCheck}
              label="Read"
              value={readCount}
              description="Already reviewed"
              iconClass="bg-emerald-100 text-emerald-600"
            />
          </section>

          {/* ================================================== */}
          {/* TOOLBAR */}
          {/* ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="mr-1 hidden items-center gap-1.5 text-xs font-semibold text-slate-500 sm:flex">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </div>

                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  label="All"
                  count={totalCount}
                />

                <FilterButton
                  active={filter === "unread"}
                  onClick={() => setFilter("unread")}
                  label="Unread"
                  count={unreadCount}
                />

                <FilterButton
                  active={filter === "read"}
                  onClick={() => setFilter("read")}
                  label="Read"
                  count={readCount}
                />
              </div>
            </div>
          </section>

          {/* ================================================== */}
          {/* CONTENT */}
          {/* ================================================== */}

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <LoadingSpinner />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              {search || filter !== "all" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Search className="h-7 w-7 text-slate-400" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    No notifications found
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    We couldn't find any notifications matching your current
                    search or filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                    className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <EmptyState message="No notifications." />
              )}
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* List header */}
              <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Bell className="h-4.5 w-4.5 text-indigo-600" />
                    Recent activity
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Showing {filteredItems.length} notification
                    {filteredItems.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    {unreadCount} unread
                  </div>
                )}
              </div>

              {/* Notification list */}
              <div className="divide-y divide-slate-100">
                {filteredItems.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    marking={markingId === notification._id}
                    onMarkRead={() => markRead(notification._id)}
                    formatDateTime={formatDateTime}
                    getNotificationStyle={getNotificationStyle}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          {!loading && items.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 shadow-sm sm:flex-row">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>
                  ArcPoint VMS keeps your visitor activity organized and
                  visible.
                </span>
              </div>

              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure activity center
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function NotificationStat({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  active = false,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-amber-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-slate-100/50 transition group-hover:scale-125" />
    </div>
  );
}

// ============================================================
// FILTER BUTTON
// ============================================================

function FilterButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {label}

      <span
        className={`rounded-md px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/15 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================
// NOTIFICATION ITEM
// ============================================================

function NotificationItem({
  notification,
  marking,
  onMarkRead,
  formatDateTime,
  getNotificationStyle,
}) {
  const {
    icon: Icon,
    iconBg,
    iconColor,
    badge,
    badgeClass,
  } = getNotificationStyle(notification);

  const unread = !notification.isRead;

  return (
    <article
      className={`group relative px-5 py-5 transition sm:px-6 ${
        unread
          ? "bg-indigo-50/35 hover:bg-indigo-50/60"
          : "bg-white hover:bg-slate-50/70"
      }`}
    >
      {/* Unread indicator */}
      {unread && (
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-indigo-600" />
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />

          {unread && (
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-sm ${
                    unread
                      ? "font-bold text-slate-900"
                      : "font-semibold text-slate-800"
                  }`}
                >
                  {notification.title}
                </h3>

                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}
                >
                  {badge}
                </span>

                {unread && (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>
                )}
              </div>

              <p
                className={`mt-2 max-w-3xl text-sm leading-6 ${
                  unread ? "text-slate-700" : "text-slate-500"
                }`}
              >
                {notification.message}
              </p>
            </div>

            {/* Desktop action */}
            <div className="hidden shrink-0 sm:block">
              {!unread ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <Check className="h-3.5 w-3.5" />
                  Read
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onMarkRead}
                  disabled={marking}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {marking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}

                  Mark read
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDateTime(notification.createdAt)}
            </span>

            {unread && (
              <span className="inline-flex items-center gap-1.5 font-medium text-indigo-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Awaiting review
              </span>
            )}
          </div>

          {/* Mobile action */}
          <div className="mt-4 sm:hidden">
            {!unread ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Check className="h-3.5 w-3.5" />
                Already read
              </div>
            ) : (
              <button
                type="button"
                onClick={onMarkRead}
                disabled={marking}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {marking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                Mark notification as read
                <ChevronRight className="ml-auto h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

