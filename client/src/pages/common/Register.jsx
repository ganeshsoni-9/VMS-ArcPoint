import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { Building2, UserPlus, CheckCircle2, ArrowLeft } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedRole: "employee",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    // Fetch departments via public route so unauthenticated users never trigger 401
    api
      .get("/departments/public")
      .then((res) => setDepartments(res.data.data.items || []))
      .catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email Address is required.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone Number is required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.requestedRole === "employee" && !form.department && departments.length > 0) {
      setError("Please select a Department for Employee registration.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/registrations", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        requestedRole: form.requestedRole,
        password: form.password,
        department: form.department || null,
        designation: form.designation,
      });

      setSuccessData(res.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // SUCCESS SCREEN — Remains visible until user clicks "Go to Login"
  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Account Created Successfully</h2>
          <p className="text-xs text-gray-500 mb-6">
            Your account has been created successfully. You can now login using your registered email and password.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Name:</span>
              <span className="text-gray-900 font-semibold">{successData.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Email:</span>
              <span className="text-gray-900">{successData.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Role:</span>
              <span className="capitalize font-semibold text-brand-700">{successData.role}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Registration Date:</span>
              <span className="text-gray-700">
                {new Date(successData.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Status:</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // PUBLIC REGISTRATION FORM
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-xs text-gray-500">Register for access to the Visitor Management System.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-b border-gray-100 pb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Personal Information
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Role & Profile
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.requestedRole}
                  onChange={(e) => setForm({ ...form, requestedRole: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                >
                  <option value="employee">Employee</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              {form.requestedRole === "employee" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Architect"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Account Security
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus size={16} />
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 hover:underline font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
