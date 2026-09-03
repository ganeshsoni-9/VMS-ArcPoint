import { NavLink } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, Building2, FileBarChart, ShieldCheck, Settings, DoorOpen, Bell, Inbox } from "lucide-react";

const LINKS = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/employees", label: "Employees", icon: Users },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
  receptionist: [
    { to: "/receptionist/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/receptionist/register", label: "Register Visitor", icon: UserPlus },
    { to: "/receptionist/visitors", label: "Visitors", icon: Users },
    { to: "/receptionist/currently-inside", label: "Currently Inside", icon: DoorOpen },
  ],
  employee: [
    { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employee/requests", label: "Requests", icon: Inbox },
    { to: "/employee/notifications", label: "Notifications", icon: Bell },
  ],
};

export default function Sidebar({ role }) {
  const links = LINKS[role] || [];
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:flex md:flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="font-semibold text-gray-900">VMS</p>
        <p className="text-xs text-gray-400">Architecture Office</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
