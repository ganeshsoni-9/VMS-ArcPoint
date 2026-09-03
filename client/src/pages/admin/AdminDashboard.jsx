import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { Users, DoorOpen, CheckCircle2, XCircle, Timer, Repeat } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then((res) => {
        setData(res.data.data);
        setState("success");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Admin Dashboard</h1>
      {state === "loading" && <LoadingSpinner label="Loading dashboard..." />}
      {state === "error" && <ErrorState message="Unable to load dashboard. Try again." />}
      {state === "success" && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <DashboardCard label="Visitors Today" value={data.visitorsToday} icon={Users} />
            <DashboardCard label="Currently Inside" value={data.currentlyInside} icon={DoorOpen} />
            <DashboardCard label="Completed Today" value={data.completedToday} icon={CheckCircle2} />
            <DashboardCard label="Rejected/Denied" value={data.rejectedOrDenied} icon={XCircle} />
            <DashboardCard label="Avg. Duration (min)" value={data.averageVisitDurationMinutes} icon={Timer} />
            <DashboardCard label="Repeat Visitors" value={data.repeatVisitors} icon={Repeat} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium mb-3">Department-wise visitors</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.departmentStats}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium mb-3">Status distribution</p>
              <ul className="space-y-2">
                {data.statusDistribution.map((s) => (
                  <li key={s._id} className="flex items-center justify-between text-sm">
                    <StatusBadge status={s._id} />
                    <span className="text-gray-600">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium mb-3">Recent visitors</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2">Visitor</th>
                  <th className="py-2">Host</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((v) => (
                  <tr key={v._id} className="border-b border-gray-50">
                    <td className="py-2">{v.visitor?.name}</td>
                    <td className="py-2">{v.host?.name}</td>
                    <td className="py-2">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
