import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { Users, DoorOpen, CheckCircle2, XCircle } from "lucide-react";

export default function ReceptionistDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setData(res.data.data));
  }, []);

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Reception Dashboard</h1>
      {!data ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard label="Visitors Today" value={data.visitorsToday} icon={Users} />
          <DashboardCard label="Currently Inside" value={data.currentlyInside} icon={DoorOpen} />
          <DashboardCard label="Completed Today" value={data.completedToday} icon={CheckCircle2} />
          <DashboardCard label="Rejected/Denied" value={data.rejectedOrDenied} icon={XCircle} />
        </div>
      )}
    </Layout>
  );
}
