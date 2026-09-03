import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={user?.role} />
      <div className="flex-1 min-w-0">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
