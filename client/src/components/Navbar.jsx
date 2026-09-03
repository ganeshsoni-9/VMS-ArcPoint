import { useAuth } from "../context/AuthContext.jsx";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <p className="text-sm text-gray-500 capitalize">{user?.role} panel</p>
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700">{user?.email}</p>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
