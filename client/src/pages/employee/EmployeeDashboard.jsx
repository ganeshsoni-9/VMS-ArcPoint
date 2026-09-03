import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { Inbox, CheckCircle2, XCircle } from "lucide-react";

export default function EmployeeDashboard() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/host/requests").then((res) => setItems(res.data.data.items));
  }, []);

  if (!items) return <Layout><LoadingSpinner /></Layout>;

  const pending = items.filter((i) => i.status === "PENDING").length;
  const approved = items.filter((i) => i.status === "APPROVED" || i.status === "INSIDE" || i.status === "COMPLETED").length;
  const rejected = items.filter((i) => i.status === "REJECTED").length;

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">My Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <DashboardCard label="Pending Requests" value={pending} icon={Inbox} />
        <DashboardCard label="Approved" value={approved} icon={CheckCircle2} />
        <DashboardCard label="Rejected" value={rejected} icon={XCircle} />
      </div>
    </Layout>
  );
}
