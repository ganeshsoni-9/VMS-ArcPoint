import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
  BriefcaseBusiness,
  Loader2,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    api
      .get("/departments/public")
      .then((res) => {
        setDepartments(res.data.data.items || []);
      })
      .catch(() => {});
  }, []);

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 6,
      number: /\d/.test(form.password),
      uppercase: /[A-Z]/.test(form.password),
      special: /[^A-Za-z0-9]/.test(form.password),
    }),
    [form.password]
  );

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrength =
    passwordScore === 0
      ? {
          label: "Enter password",
          width: "0%",
        }
      : passwordScore <= 1
      ? {
          label: "Weak",
          width: "25%",
        }
      : passwordScore === 2
      ? {
          label: "Fair",
          width: "50%",
        }
      : passwordScore === 3
      ? {
          label: "Good",
          width: "75%",
        }
      : {
          label: "Strong",
          width: "100%",
        };

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

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

    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
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

    if (
      form.requestedRole === "employee" &&
      !form.department &&
      departments.length > 0
    ) {
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
      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     SUCCESS SCREEN
  ========================================================= */

  if (successData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 rounded-[30px] blur opacity-20" />

          <div className="relative bg-white rounded-[28px] shadow-2xl overflow-hidden">
            {/* Top */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 px-8 py-10 text-center text-white">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/15 border border-white/25 backdrop-blur-xl flex items-center justify-center shadow-xl mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                  <CheckCircle2
                    size={34}
                    className="text-emerald-500"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-4">
                <Sparkles size={13} />
                Registration Complete
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Account Created Successfully
              </h1>

              <p className="text-blue-100 text-sm mt-3 max-w-md mx-auto leading-6">
                Welcome to the Visitor Management System. Your account is ready
                and you can now access your dashboard.
              </p>
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BadgeCheck size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Account Information
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Your registration details
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <SuccessRow
                    label="Full Name"
                    value={successData.name}
                    icon={<User size={15} />}
                  />

                  <SuccessRow
                    label="Email Address"
                    value={successData.email}
                    icon={<Mail size={15} />}
                  />

                  <SuccessRow
                    label="Role"
                    value={successData.role}
                    capitalize
                    icon={<Users size={15} />}
                  />

                  <SuccessRow
                    label="Registration Date"
                    value={new Date(
                      successData.createdAt || Date.now()
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    icon={<Clock3 size={15} />}
                  />

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      Account Status
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="group w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-slate-950/10"
              >
                Go to Login
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <p className="text-center text-[11px] text-slate-400 mt-4">
                Secure access • Visitor Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN REGISTRATION PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}

      <aside className="hidden lg:flex lg:w-[42%] xl:w-[44%] relative bg-slate-950 overflow-hidden">
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950" />

        {/* Glow */}
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-indigo-600/25 rounded-full blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-3xl" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-8 xl:p-12">
          {/* Logo */}
          <div>
            <Link to="/login" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl flex items-center justify-center shadow-lg">
                <Building2
                  size={24}
                  className="text-white"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <div className="text-white font-bold text-lg tracking-tight">
                  ArcPoint
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold">
                  Visitor Management
                </div>
              </div>
            </Link>
          </div>

          {/* Hero */}
          <div className="max-w-xl my-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-200 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Secure Workplace Access
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Welcome to a smarter way of managing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300">
                visitors.
              </span>
            </h1>

            <p className="text-slate-400 text-sm xl:text-base leading-7 mt-6 max-w-lg">
              Create your account and join the ArcPoint workplace network.
              Manage visitors, hosts and workplace access from one secure
              platform.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-9">
              <Feature
                icon={<ShieldCheck size={17} />}
                title="Secure Access"
                text="Role-based permissions"
              />

              <Feature
                icon={<Users size={17} />}
                title="Easy Management"
                text="Simple visitor workflows"
              />

              <Feature
                icon={<Clock3 size={17} />}
                title="Real-time Tracking"
                text="Know who is on-site"
              />

              <Feature
                icon={<BadgeCheck size={17} />}
                title="Professional"
                text="Built for modern offices"
              />
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={13} />
              Secure Workplace Network
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LockKeyhole size={13} />
              Protected
            </div>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute right-[-100px] top-[42%] w-56 h-56 border border-white/5 rounded-full" />
        <div className="absolute right-[-50px] top-[48%] w-32 h-32 border border-indigo-400/10 rounded-full" />
      </aside>

      {/* =====================================================
          RIGHT FORM AREA
      ===================================================== */}

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="w-full max-w-2xl">
            {/* Mobile Branding */}
            <div className="lg:hidden mb-6">
              <Link to="/login" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Building2 size={22} />
                </div>

                <div>
                  <div className="font-bold text-slate-950">ArcPoint</div>
                  <div className="text-[9px] uppercase tracking-[0.18em] text-indigo-600 font-bold">
                    Visitor Management
                  </div>
                </div>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-5"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                    <UserPlus size={14} />
                    New Registration
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                    Create your account
                  </h2>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Complete the form below to get access to the Visitor
                    Management System.
                  </p>
                </div>

                <div className="hidden sm:flex w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center">
                  <Sparkles size={19} />
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_20px_70px_-25px_rgba(15,23,42,0.25)] overflow-hidden">
              {/* Progress Header */}
              <div className="px-5 sm:px-7 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
                      1
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Account Setup
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Your information is secure
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-8 h-1 rounded-full bg-indigo-600" />
                    <span className="w-8 h-1 rounded-full bg-slate-200" />
                    <span className="w-8 h-1 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>

              <form onSubmit={onSubmit} className="p-5 sm:p-7">
                {/* Error */}
                {error && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <CircleAlert size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-red-800">
                        Registration Error
                      </p>
                      <p className="text-xs text-red-600 mt-0.5 leading-5">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    PERSONAL INFORMATION
                ================================================== */}

                <FormSection
                  icon={<User size={16} />}
                  title="Personal Information"
                  description="Tell us a little about yourself"
                >
                  <div className="space-y-4">
                    <InputField
                      label="Full Name"
                      required
                      icon={<User size={17} />}
                      placeholder="e.g. Rahul Sharma"
                      value={form.fullName}
                      onChange={(e) =>
                        updateForm("fullName", e.target.value)
                      }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Phone Number"
                        required
                        icon={<Phone size={17} />}
                        type="tel"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(e) =>
                          updateForm(
                            "phone",
                            e.target.value.replace(/[^\d+\s-]/g, "")
                          )
                        }
                      />

                      <InputField
                        label="Email Address"
                        required
                        icon={<Mail size={17} />}
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                      />
                    </div>
                  </div>
                </FormSection>

                {/* =================================================
                    ROLE
                ================================================== */}

                <FormSection
                  icon={<BriefcaseBusiness size={16} />}
                  title="Role & Profile"
                  description="Choose how you will use the system"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Account Role <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RoleCard
                          active={form.requestedRole === "employee"}
                          icon={<Users size={20} />}
                          title="Employee"
                          description="Manage and host visitors"
                          onClick={() =>
                            updateForm("requestedRole", "employee")
                          }
                        />

                        <RoleCard
                          active={form.requestedRole === "receptionist"}
                          icon={<Building2 size={20} />}
                          title="Receptionist"
                          description="Register and manage visitors"
                          onClick={() =>
                            updateForm("requestedRole", "receptionist")
                          }
                        />
                      </div>
                    </div>

                    {form.requestedRole === "employee" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <SelectField
                          label="Department"
                          required
                          icon={<Building2 size={17} />}
                          value={form.department}
                          onChange={(e) =>
                            updateForm("department", e.target.value)
                          }
                          options={departments}
                        />

                        <InputField
                          label="Designation"
                          icon={<BriefcaseBusiness size={17} />}
                          placeholder="e.g. Senior Architect"
                          value={form.designation}
                          onChange={(e) =>
                            updateForm("designation", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* =================================================
                    SECURITY
                ================================================== */}

                <FormSection
                  icon={<LockKeyhole size={16} />}
                  title="Account Security"
                  description="Create a strong password for your account"
                  last
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordField
                        label="Password"
                        required
                        value={form.password}
                        show={showPassword}
                        onToggle={() => setShowPassword((prev) => !prev)}
                        onChange={(e) =>
                          updateForm("password", e.target.value)
                        }
                      />

                      <PasswordField
                        label="Confirm Password"
                        required
                        value={form.confirmPassword}
                        show={showConfirmPassword}
                        onToggle={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        onChange={(e) =>
                          updateForm("confirmPassword", e.target.value)
                        }
                      />
                    </div>

                    {/* Password Strength */}
                    {form.password && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-600">
                            Password strength
                          </span>

                          <span
                            className={`text-[11px] font-bold ${
                              passwordScore >= 3
                                ? "text-emerald-600"
                                : passwordScore === 2
                                ? "text-amber-600"
                                : "text-red-500"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>

                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-4">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{
                              width: passwordStrength.width,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <PasswordRule
                            active={passwordChecks.length}
                            text="6+ characters"
                          />

                          <PasswordRule
                            active={passwordChecks.number}
                            text="One number"
                          />

                          <PasswordRule
                            active={passwordChecks.uppercase}
                            text="Uppercase letter"
                          />

                          <PasswordRule
                            active={passwordChecks.special}
                            text="Special character"
                          />
                        </div>
                      </div>
                    )}

                    {form.confirmPassword && (
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold ${
                          form.password === form.confirmPassword
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {form.password === form.confirmPassword ? (
                          <>
                            <CheckCircle2 size={15} />
                            Passwords match
                          </>
                        ) : (
                          <>
                            <CircleAlert size={15} />
                            Passwords do not match
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* Submit */}
                <div className="mt-7">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative w-full overflow-hidden rounded-2xl bg-slate-950 hover:bg-indigo-600 disabled:bg-slate-400 text-white py-3.5 font-bold text-sm transition-all duration-300 shadow-lg shadow-slate-950/10 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Creating Your Account...
                        </>
                      ) : (
                        <>
                          <UserPlus size={17} />
                          Create Account
                          <ArrowRight
                            size={17}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </span>

                    {!submitting && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    )}
                  </button>
                </div>

                {/* Terms */}
                <p className="text-center text-[10px] sm:text-[11px] text-slate-400 leading-5 mt-4 max-w-md mx-auto">
                  By creating an account, you agree to use the Visitor
                  Management System responsibly and follow your organization's
                  access policies.
                </p>
              </form>

              {/* Login Footer */}
              <div className="px-5 sm:px-7 py-5 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-5 mt-5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} />
                Secure
              </span>

              <span className="w-1 h-1 rounded-full bg-slate-300" />

              <span className="flex items-center gap-1">
                <LockKeyhole size={12} />
                Protected
              </span>

              <span className="w-1 h-1 rounded-full bg-slate-300" />

              <span>ArcPoint VMS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============================================================
   FEATURE
============================================================= */

function Feature({ icon, title, text }) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-3.5 transition-all duration-300">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-400/10 text-indigo-300 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-200">{title}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{text}</p>
      </div>
    </div>
  );
}

/* =============================================================
   FORM SECTION
============================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
  last = false,
}) {
  return (
    <section className={!last ? "pb-7 mb-7 border-b border-slate-100" : ""}>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =============================================================
   INPUT
============================================================= */

function InputField({
  label,
  required,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {icon}
        </div>

        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>
  );
}

/* =============================================================
   SELECT
============================================================= */

function SelectField({
  label,
  required,
  icon,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          {icon}
        </div>

        <select
          required={required}
          value={value}
          onChange={onChange}
          className="appearance-none w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 text-sm text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
        >
          <option value="">Select Department</option>

          {options.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

/* =============================================================
   PASSWORD FIELD
============================================================= */

function PasswordField({
  label,
  required,
  value,
  show,
  onToggle,
  onChange,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <LockKeyhole size={17} />
        </div>

        <input
          type={show ? "text" : "password"}
          required={required}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   ROLE CARD
============================================================= */

function RoleCard({
  active,
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
        active
          ? "border-indigo-500 bg-indigo-50/70 shadow-sm shadow-indigo-500/10"
          : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white"
      }`}
    >
      {active && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
          <Check size={12} strokeWidth={3} />
        </div>
      )}

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-white border border-slate-200 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <p className="text-sm font-bold text-slate-900">{title}</p>

      <p className="text-[10px] text-slate-500 mt-1 pr-5">
        {description}
      </p>
    </button>
  );
}

/* =============================================================
   PASSWORD RULE
============================================================= */

function PasswordRule({ active, text }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[10px] ${
        active ? "text-emerald-600" : "text-slate-400"
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          active ? "bg-emerald-100" : "bg-slate-200"
        }`}
      >
        <Check size={9} strokeWidth={3} />
      </div>

      {text}
    </div>
  );
}

/* =============================================================
   SUCCESS ROW
============================================================= */

function SuccessRow({ label, value, icon, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>

      <span
        className={`text-xs font-bold text-slate-800 text-right ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}