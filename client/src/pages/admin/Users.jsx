import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  KeyRound,
  UserX,
  UserCheck,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
  X,
  Lock,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    password: "",
    confirmPassword: "",
    employee: "",
    active: true,
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    employee: "",
    active: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { toast, showToast, clearToast } = useToast();

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, empRes] = await Promise.all([
        api.get("/users"),
        api.get("/employees?active=true"),
      ]);
      setUsers(usersRes.data.data.items || []);
      setEmployees(empRes.data.data.items || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search, role, status, source
  const filteredUsers = users.filter((u) => {
    const name = (u.name || u.employee?.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" ? u.active : !u.active);
    const matchesSource =
      !sourceFilter || u.registrationSource === sourceFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesSource;
  });

  // Create User Handler
  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError("");

    if (createForm.password !== createForm.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (createForm.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    if (createForm.role === "employee" && !createForm.employee) {
      setFormError("Please select an existing Employee profile to link");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/users", {
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone,
        role: createForm.role,
        password: createForm.password,
        employee: createForm.role === "employee" ? createForm.employee : null,
        active: createForm.active,
      });

      showToast("User account created successfully");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        role: "employee",
        password: "",
        confirmPassword: "",
        employee: "",
        active: true,
      });
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create user account");
    } finally {
      setSubmitting(false);
    }
  }

  // Edit User Handler
  function openEditModal(user) {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "employee",
      employee: user.employee?._id || user.employee || "",
      active: user.active ?? true,
    });
    setFormError("");
    setShowEditModal(true);
  }

  async function handleEditUser(e) {
    e.preventDefault();
    setFormError("");

    if (editForm.role === "employee" && !editForm.employee) {
      setFormError("Please select an existing Employee profile to link");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/users/${selectedUser._id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        employee: editForm.role === "employee" ? editForm.employee : null,
        active: editForm.active,
      });

      showToast("User updated successfully");
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle Status Handler
  async function handleToggleStatus(user) {
    const targetStatus = !user.active;
    try {
      await api.patch(`/users/${user._id}/status`, { active: targetStatus });
      showToast(`User ${targetStatus ? "activated" : "deactivated"} successfully`);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Status change failed", "error");
    }
  }

  // Password Reset Handler
  function openPasswordModal(user) {
    setSelectedUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setFormError("");
    setShowPasswordModal(true);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setFormError("");

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (passwordForm.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/users/${selectedUser._id}/password`, {
        password: passwordForm.password,
      });

      showToast("Password reset successfully");
      setShowPasswordModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Password reset failed");
    } finally {
      setSubmitting(false);
    }
  }

  // View User Details
  function openViewModal(user) {
    setSelectedUser(user);
    setShowViewModal(true);
  }

  // Helper badge color renderer
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "receptionist":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "employee":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage system access, roles, and profiles for administrators, receptionists, and employees.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError("");
            setCreateForm({
              name: "",
              email: "",
              phone: "",
              role: "employee",
              password: "",
              confirmPassword: "",
              employee: "",
              active: true,
            });
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          <span>Create New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 hidden md:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading user accounts..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState message="No user accounts match your criteria." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Employee Association</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const displayName =
                    user.name || user.employee?.name || "Unnamed User";
                  const displayPhone = user.phone || user.employee?.phone || "";

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-xs shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{displayName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            {displayPhone && (
                              <p className="text-xs text-gray-400">{displayPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {user.role === "employee" && user.employee ? (
                          <div>
                            <p className="text-gray-900 font-medium">{user.employee.name}</p>
                            <p className="text-xs text-gray-500">
                              {user.employee.department?.name || "Department N/A"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">N/A (Standalone)</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "Never"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            title="View Details"
                            onClick={() => openViewModal(user)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit User"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            title="Reset Password"
                            onClick={() => openPasswordModal(user)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            title={user.active ? "Deactivate User" : "Activate User"}
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.active
                                ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create New User</h3>
                <p className="text-xs text-gray-500">
                  Add user credentials and assign access permissions.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Conditional Employee dropdown */}
              {createForm.role === "employee" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Employee Profile <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={createForm.employee}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, employee: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email}) - {emp.department?.name || "No Dept"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Full Name & Phone (standalone or override) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name {createForm.role !== "employee" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={createForm.role !== "employee"}
                    placeholder="Full Name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@vms.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, confirmPassword: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="createActive"
                  checked={createForm.active}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="createActive" className="text-xs font-medium text-gray-700">
                  Set account as Active immediately
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit User Account</h3>
                <p className="text-xs text-gray-500">Update account role and details.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select
                  required
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {editForm.role === "employee" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Linked Employee Profile <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editForm.employee}
                    onChange={(e) =>
                      setEditForm({ ...editForm, employee: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email}) - {emp.department?.name || "No Dept"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editForm.active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, active: e.target.checked })
                  }
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="editActive" className="text-xs font-medium text-gray-700">
                  Account Active Status
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reset User Password</h3>
                <p className="text-xs text-gray-500">
                  Set a new password for {selectedUser.email}.
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.password}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, password: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS MODAL */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                  {(selectedUser.name || selectedUser.employee?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {selectedUser.name || selectedUser.employee?.name || "User Details"}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadge(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{selectedUser.email}</span>
              </div>

              {(selectedUser.phone || selectedUser.employee?.phone) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{selectedUser.phone || selectedUser.employee?.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Shield size={16} className="text-gray-400" />
                <span>
                  Registration Source:{" "}
                  <strong className="text-brand-700">
                    {selectedUser.registrationSource === "PUBLIC_REGISTRATION"
                      ? "Self Registration"
                      : "Admin Created"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Registered At:{" "}
                  {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  Last Login:{" "}
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>

              {selectedUser.role === "employee" && selectedUser.employee && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs">
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Building size={14} className="text-brand-600" /> Linked Employee Record
                  </p>
                  <p className="text-gray-700">Name: {selectedUser.employee.name}</p>
                  <p className="text-gray-700">
                    Department: {selectedUser.employee.department?.name || "N/A"}
                  </p>
                  {selectedUser.employee.designation && (
                    <p className="text-gray-700">Designation: {selectedUser.employee.designation}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-5">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
