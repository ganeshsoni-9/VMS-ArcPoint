import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/common/Login.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Employees from "./pages/admin/Employees.jsx";
import Departments from "./pages/admin/Departments.jsx";
import Reports from "./pages/admin/Reports.jsx";
import AuditLogs from "./pages/admin/AuditLogs.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard.jsx";
import RegisterVisitor from "./pages/receptionist/RegisterVisitor.jsx";
import VisitorsList from "./pages/receptionist/VisitorsList.jsx";
import CurrentlyInside from "./pages/receptionist/CurrentlyInside.jsx";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard.jsx";
import Requests from "./pages/employee/Requests.jsx";
import Notifications from "./pages/employee/Notifications.jsx";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<Employees />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route element={<ProtectedRoute roles={["receptionist", "admin"]} />}>
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/receptionist/register" element={<RegisterVisitor />} />
        <Route path="/receptionist/visitors" element={<VisitorsList />} />
        <Route path="/receptionist/currently-inside" element={<CurrentlyInside />} />
      </Route>

      <Route element={<ProtectedRoute roles={["employee"]} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/requests" element={<Requests />} />
        <Route path="/employee/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
