import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  UserRoundCheck,
  Loader2,
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden">
      {/* =========================================================
          LEFT BRANDING PANEL
      ========================================================== */}

      <aside className="hidden lg:flex lg:w-[42%] xl:w-[44%] relative bg-slate-950 overflow-hidden">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950" />

        {/* Glow effects */}
        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-indigo-600/25 rounded-full blur-3xl" />

        <div className="absolute bottom-[-200px] right-[-150px] w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-3xl" />

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-8 xl:p-12">
          {/* =====================================================
              LOGO
          ====================================================== */}

          <div>
            <Link to="/login" className="inline-flex items-center gap-3">
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

          {/* =====================================================
              HERO CONTENT
          ====================================================== */}

          <div className="max-w-xl my-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-200 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Secure Workplace Access
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Your workplace,
              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300">
                securely connected.
              </span>
            </h1>

            <p className="text-slate-400 text-sm xl:text-base leading-7 mt-6 max-w-lg">
              Sign in to your ArcPoint Visitor Management account and manage
              workplace visitors, hosts and access from one secure platform.
            </p>

            {/* =================================================
                FEATURES
            ================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-9">
              <Feature
                icon={<ShieldCheck size={17} />}
                title="Secure Access"
                text="Role-based permissions"
              />

              <Feature
                icon={<Users size={17} />}
                title="Visitor Management"
                text="Complete visitor workflow"
              />

              <Feature
                icon={<Clock3 size={17} />}
                title="Real-time Tracking"
                text="Know who is on-site"
              />

              <Feature
                icon={<CheckCircle2 size={17} />}
                title="Reliable System"
                text="Built for modern offices"
              />
            </div>
          </div>

          {/* =====================================================
              BOTTOM
          ====================================================== */}

          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LockKeyhole size={13} />
              Secure Workplace Network
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={13} />
              Protected
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-[-100px] top-[42%] w-56 h-56 border border-white/5 rounded-full" />

        <div className="absolute right-[-50px] top-[48%] w-32 h-32 border border-indigo-400/10 rounded-full" />
      </aside>

      {/* =========================================================
          RIGHT LOGIN AREA
      ========================================================== */}

      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* =================================================
                MOBILE BRANDING
            ================================================== */}

            <div className="lg:hidden mb-7">
              <Link to="/login" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Building2 size={22} />
                </div>

                <div>
                  <div className="font-bold text-slate-950">
                    ArcPoint
                  </div>

                  <div className="text-[9px] uppercase tracking-[0.18em] text-indigo-600 font-bold">
                    Visitor Management
                  </div>
                </div>
              </Link>
            </div>

            {/* =================================================
                LOGIN HEADER
            ================================================== */}

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
                <LockKeyhole size={14} />
                Secure Login
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-950 tracking-tight">
                    Welcome back
                  </h1>

                  <p className="text-sm text-slate-500 mt-2 leading-6">
                    Sign in to continue to your Visitor Management System.
                  </p>
                </div>

                <div className="hidden sm:flex w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 items-center justify-center">
                  <Sparkles size={19} />
                </div>
              </div>
            </div>

            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_20px_70px_-25px_rgba(15,23,42,0.25)] overflow-hidden">
              {/* Top Security Bar */}

              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Secure Authentication
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Your credentials are protected
                    </p>
                  </div>

                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Secure
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <CircleAlert size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-red-800">
                        Login Failed
                      </p>

                      <p className="text-xs text-red-600 mt-0.5 leading-5">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    FORM
                ================================================== */}

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Email */}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Mail size={17} />
                      </div>

                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="you@example.com"
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>

                  {/* Password */}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                    </div>

                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <KeyRound size={17} />
                      </div>

                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);

                          if (error) {
                            setError("");
                          }
                        }}
                        placeholder="••••••••"
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* =================================================
                      REMEMBER / SECURITY
                  ================================================== */}

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />

                      <span className="text-[11px] text-slate-500">
                        Keep me signed in
                      </span>
                    </label>

                    <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <LockKeyhole size={12} />
                      Secure session
                    </span>
                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-slate-950 hover:bg-indigo-600 disabled:bg-slate-400 text-white py-3.5 font-bold text-sm transition-all duration-300 shadow-lg shadow-slate-950/10 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Signing you in...
                        </>
                      ) : (
                        <>
                          Sign in to Dashboard
                          <ArrowRight
                            size={17}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </span>

                    {!loading && (
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    )}
                  </button>
                </form>

                {/* =================================================
                    REGISTER
                ================================================== */}

                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider">
                      New to ArcPoint?
                    </span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="group w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                >
                  <UserPlus size={16} />

                  Create an Account

                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* =================================================
                  DEMO CREDENTIALS
              ================================================== */}

              <div className="bg-slate-50 border-t border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <UserRoundCheck size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Demo Accounts
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Use these accounts for testing
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <DemoCredential
                    role="Administrator"
                    email="admin@vms.demo"
                    password="Admin@123"
                    icon={<ShieldCheck size={15} />}
                  />

                  <DemoCredential
                    role="Receptionist"
                    email="reception@vms.demo"
                    password="Reception@123"
                    icon={<Building2 size={15} />}
                  />

                  <DemoCredential
                    role="Employee"
                    email="employee@vms.demo"
                    password="Employee@123"
                    icon={<Users size={15} />}
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================== */}

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
   FEATURE COMPONENT
============================================================= */

function Feature({ icon, title, text }) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] px-4 py-3.5 transition-all duration-300">
      <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-400/10 text-indigo-300 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-slate-200">
          {title}
        </p>

        <p className="text-[10px] text-slate-500 mt-0.5">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   DEMO CREDENTIAL COMPONENT
============================================================= */

function DemoCredential({
  role,
  email,
  password,
  icon,
}) {
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
          {icon}
        </div>

        <span className="text-[11px] font-bold text-slate-700">
          {role}
        </span>
      </div>

      <div className="pl-9 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400">
            Email
          </span>

          <span className="text-[10px] font-medium text-slate-600 truncate">
            {email}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400">
            Password
          </span>

          <span className="text-[10px] font-mono font-semibold text-slate-600">
            {password}
          </span>
        </div>
      </div>
    </div>
  );
}