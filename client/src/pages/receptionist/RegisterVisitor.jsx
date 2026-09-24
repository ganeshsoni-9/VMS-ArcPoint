import { useEffect, useMemo, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

import {
  UserRound,
  Phone,
  Mail,
  Building2,
  UserCheck,
  BriefcaseBusiness,
  FileText,
  CalendarDays,
  Car,
  Package,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  BadgeCheck,
  Clock3,
  Hash,
} from "lucide-react";

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  organisation: "",
  host: "",
  department: "",
  purpose: "",
  visitDate: "",
  vehicleNumber: "",
  itemsCarried: "",
  consent: false,
};

export default function RegisterVisitor() {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    setLoading(true);

    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
      ]);

      setEmployees(employeesRes.data?.data?.items || []);
      setDepartments(departmentsRes.data?.data?.items || []);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Unable to load employees and departments",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.consent) {
      showToast("Visitor consent is required", "error");
      return;
    }

    if (!form.name.trim()) {
      showToast("Please enter visitor name", "error");
      return;
    }

    if (!form.mobile.trim()) {
      showToast("Please enter visitor mobile number", "error");
      return;
    }

    if (!form.email.trim()) {
      showToast(
        "Please enter visitor email — needed to send approval/rejection updates",
        "error"
      );
      return;
    }

    if (!form.host) {
      showToast("Please select a host / employee", "error");
      return;
    }

    if (!form.department) {
      showToast("Please select a department", "error");
      return;
    }

    if (!form.purpose.trim()) {
      showToast("Please enter purpose of visit", "error");
      return;
    }

    if (!form.visitDate) {
      showToast("Please select visit date", "error");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/visitors", form);

      setResult(res.data?.data || null);

      showToast("Visitor registered successfully");

      setForm(initialForm);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      showToast(
        err.response?.data?.message || "Visitor registration failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedEmployee = useMemo(() => {
    if (!result?.visit?.host) return null;

    return (
      employees.find((employee) => employee._id === result.visit.host) || null
    );
  }, [employees, result]);

  const selectedDepartment = useMemo(() => {
    if (!result?.visit?.department) return null;

    return (
      departments.find(
        (department) => department._id === result.visit.department
      ) || null
    );
  }, [departments, result]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* =====================================================
              HERO
          ====================================================== */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-cyan-500/10" />

            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
                    <UserRound className="w-7 h-7 text-indigo-300" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Reception Workspace
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                        Visitor Management
                      </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Register New Visitor
                    </h1>

                    <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
                      Create a visitor record and send the visit request to the
                      selected employee for approval.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadOptions}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-semibold transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh Data
                </button>
              </div>

              {/* Steps */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StepCard
                  number="01"
                  title="Visitor Details"
                  text="Enter visitor information"
                  active
                />

                <StepCard
                  number="02"
                  title="Host Approval"
                  text="Employee reviews request"
                />

                <StepCard
                  number="03"
                  title="Visit Access"
                  text="Visitor gets approved access"
                />
              </div>
            </div>
          </section>

          {/* =====================================================
              SUCCESS RESULT
          ====================================================== */}
          {result && (
            <SuccessCard
              result={result}
              selectedEmployee={selectedEmployee}
              selectedDepartment={selectedDepartment}
            />
          )}

          {/* =====================================================
              MAIN CONTENT
          ====================================================== */}
          <div className="grid xl:grid-cols-[minmax(0,1fr)_330px] gap-6">

            {/* FORM */}
            <form
              onSubmit={onSubmit}
              className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-6 md:px-8 py-6 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                      Visitor Registration
                    </p>

                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      Visitor Information
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Fill in the details below to create a new visitor
                      request.
                    </p>
                  </div>

                  <div className="hidden sm:flex w-11 h-11 rounded-xl bg-indigo-50 items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">

                {/* =================================================
                    PERSONAL DETAILS
                ================================================== */}
                <FormSection
                  icon={UserRound}
                  title="Personal Details"
                  description="Basic information about the visitor"
                >
                  <div className="grid md:grid-cols-2 gap-5">

                    <Field
                      label="Full Name"
                      required
                      icon={UserRound}
                    >
                      <input
                        required
                        type="text"
                        placeholder="Enter visitor full name"
                        value={form.name}
                        onChange={(e) =>
                          updateField("name", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Mobile Number"
                      required
                      icon={Phone}
                    >
                      <input
                        required
                        type="tel"
                        placeholder="Enter mobile number"
                        value={form.mobile}
                        onChange={(e) =>
                          updateField("mobile", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Email Address"
                      icon={Mail}
                      hint="Required — used to send approval/rejection updates"
                    >
                      <input
                        required
                        type="email"
                        placeholder="visitor@example.com"
                        value={form.email}
                        onChange={(e) =>
                          updateField("email", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field
                      label="Organisation"
                      icon={Building2}
                      hint="Optional"
                    >
                      <input
                        type="text"
                        placeholder="Company / Organisation name"
                        value={form.organisation}
                        onChange={(e) =>
                          updateField("organisation", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* =================================================
                    HOST DETAILS
                ================================================== */}
                <FormSection
                  icon={UserCheck}
                  title="Host & Department"
                  description="Select the employee who will receive the approval request"
                >
                  <div className="grid md:grid-cols-2 gap-5">

                    <Field
                      label="Host / Employee"
                      required
                      icon={UserCheck}
                    >
                      <div className="relative">
                        <select
                          required
                          value={form.host}
                          onChange={(e) =>
                            updateField("host", e.target.value)
                          }
                          disabled={loading}
                          className={`${selectClass} ${
                            loading ? "opacity-60" : ""
                          }`}
                        >
                          <option value="">
                            {loading
                              ? "Loading employees..."
                              : "Select host / employee"}
                          </option>

                          {employees.map((employee) => (
                            <option
                              key={employee._id}
                              value={employee._id}
                            >
                              {employee.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field
                      label="Department"
                      required
                      icon={BriefcaseBusiness}
                    >
                      <select
                        required
                        value={form.department}
                        onChange={(e) =>
                          updateField("department", e.target.value)
                        }
                        disabled={loading}
                        className={`${selectClass} ${
                          loading ? "opacity-60" : ""
                        }`}
                      >
                        <option value="">
                          {loading
                            ? "Loading departments..."
                            : "Select department"}
                        </option>

                        {departments.map((department) => (
                          <option
                            key={department._id}
                            value={department._id}
                          >
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </FormSection>

                {/* =================================================
                    VISIT DETAILS
                ================================================== */}
                <FormSection
                  icon={CalendarDays}
                  title="Visit Details"
                  description="Provide the purpose and schedule of the visit"
                >
                  <div className="space-y-5">

                    <Field
                      label="Purpose of Visit"
                      required
                      icon={FileText}
                    >
                      <textarea
                        required
                        rows={4}
                        placeholder="Example: Project discussion, client meeting, interview..."
                        value={form.purpose}
                        onChange={(e) =>
                          updateField("purpose", e.target.value)
                        }
                        className={`${inputClass} resize-none`}
                      />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-5">

                      <Field
                        label="Visit Date"
                        required
                        icon={CalendarDays}
                      >
                        <input
                          required
                          type="date"
                          value={form.visitDate}
                          onChange={(e) =>
                            updateField("visitDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Vehicle Number"
                        icon={Car}
                        hint="Optional"
                      >
                        <input
                          type="text"
                          placeholder="Example: RJ14AB1234"
                          value={form.vehicleNumber}
                          onChange={(e) =>
                            updateField("vehicleNumber", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Items Carried"
                      icon={Package}
                      hint="Optional"
                    >
                      <input
                        type="text"
                        placeholder="Laptop, documents, equipment..."
                        value={form.itemsCarried}
                        onChange={(e) =>
                          updateField("itemsCarried", e.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </FormSection>

                {/* =================================================
                    PRIVACY NOTICE
                ================================================== */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Privacy & Data Protection
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 leading-6 mt-1">
                        Visitor information is stored securely for visitor
                        management and access-control purposes. Photo and
                        identity-document upload are intentionally outside the
                        current build.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    CONSENT
                ================================================== */}
                <label
                  className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition ${
                    form.consent
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) =>
                      updateField("consent", e.target.checked)
                    }
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          form.consent
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      />

                      <p className="text-sm font-bold text-slate-900">
                        Visitor Consent
                        <span className="text-red-500 ml-1">*</span>
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-5">
                      I confirm that the visitor has provided consent to
                      store their information for visitor management purposes.
                    </p>
                  </div>
                </label>

                {/* =================================================
                    SUBMIT
                ================================================== */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="group w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-950 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 px-6 shadow-lg shadow-slate-900/10 hover:shadow-indigo-700/20 transition-all duration-200"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering Visitor...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Register Visitor
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400 mt-3">
                    The request will be sent to the selected employee for
                    approval.
                  </p>
                </div>
              </div>
            </form>

            {/* =====================================================
                RIGHT SIDEBAR
            ====================================================== */}
            <aside className="space-y-5">

              {/* Security Card */}
              <div className="rounded-3xl bg-slate-950 text-white p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Secure Registration
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Protected visitor workflow
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <SecurityRow text="Visitor data validation" />
                  <SecurityRow text="Employee approval workflow" />
                  <SecurityRow text="Consent verification" />
                  <SecurityRow text="Access-controlled records" />
                </div>
              </div>

              {/* Workflow Card */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Clock3 className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      What happens next?
                    </h3>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Visitor approval workflow
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <WorkflowStep
                    number="1"
                    title="Registration"
                    text="Receptionist creates the visitor request."
                    active
                  />

                  <WorkflowStep
                    number="2"
                    title="Employee Review"
                    text="Selected host approves or rejects the request."
                  />

                  <WorkflowStep
                    number="3"
                    title="Visitor Access"
                    text="Approved visitor can proceed through the access workflow."
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <MiniStat
                  icon={UserRound}
                  value={employees.length}
                  label="Employees"
                />

                <MiniStat
                  icon={Building2}
                  value={departments.length}
                  label="Departments"
                />
              </div>

              {/* Tip */}
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />

                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      Reception Tip
                    </p>

                    <p className="text-xs text-amber-800/80 mt-1 leading-5">
                      Double-check the visitor mobile number and selected host
                      before submitting the registration.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pb-4">
            <p className="text-xs text-slate-400">
              ArcPoint Visitor Management System
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Registration service operational
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}

/* ================================================================
   CONSTANT CLASSES
================================================================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300";

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 disabled:cursor-not-allowed";

/* ================================================================
   FORM SECTION
================================================================ */

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section>
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ================================================================
   FIELD
================================================================ */

function Field({
  label,
  required = false,
  hint,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {Icon && (
            <Icon className="w-4 h-4 text-slate-400" />
          )}

          {label}

          {required && (
            <span className="text-red-500">*</span>
          )}
        </label>

        {hint && (
          <span className="text-[11px] font-medium text-slate-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

/* ================================================================
   STEP CARD
================================================================ */

function StepCard({
  number,
  title,
  text,
  active = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        active
          ? "bg-white/10 border-white/15"
          : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
            active
              ? "bg-white text-slate-950"
              : "bg-white/10 text-slate-300"
          }`}
        >
          {number}
        </span>

        <div>
          <p className="text-sm font-bold">
            {title}
          </p>

          <p className="text-xs text-slate-400 mt-0.5">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SUCCESS CARD
================================================================ */

function SuccessCard({
  result,
  selectedEmployee,
  selectedDepartment,
}) {
  const visitor = result?.visitor || {};
  const visit = result?.visit || {};

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-indigo-50/40 pointer-events-none" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Registration Complete
                </span>

                {result.blacklisted && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                    <AlertTriangle className="w-3 h-3" />
                    Blacklist Flag
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                Visitor registered successfully
              </h2>

              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                The visitor request has been sent to the selected employee
                for approval.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 text-white px-5 py-4 min-w-[220px]">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Hash className="w-4 h-4" />
              Visitor Pass ID
            </div>

            <p className="font-mono text-lg font-bold text-white mt-2">
              {visit.visitorPassId || "Pending"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
          <ResultItem
            label="Visitor"
            value={visitor.name || "—"}
            icon={UserRound}
          />

          <ResultItem
            label="Host"
            value={selectedEmployee?.name || "Selected Employee"}
            icon={UserCheck}
          />

          <ResultItem
            label="Department"
            value={selectedDepartment?.name || "Selected Department"}
            icon={Building2}
          />

          <ResultItem
            label="Status"
            value="Pending Approval"
            icon={Clock3}
            amber
          />
        </div>

        {result.blacklisted && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />

              <div>
                <p className="text-sm font-bold text-red-900">
                  Blacklist Warning
                </p>

                <p className="text-xs sm:text-sm text-red-700 mt-1">
                  This visitor is flagged on the blacklist. Follow your
                  organization's verification procedure before granting
                  physical access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ================================================================
   RESULT ITEM
================================================================ */

function ResultItem({
  label,
  value,
  icon: Icon,
  amber = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Icon className="w-4 h-4" />
        {label}
      </div>

      <p
        className={`text-sm font-bold mt-2 ${
          amber ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ================================================================
   SECURITY ROW
================================================================ */

function SecurityRow({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-emerald-400/10 flex items-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      </div>

      <span className="text-xs text-slate-300">
        {text}
      </span>
    </div>
  );
}

/* ================================================================
   WORKFLOW STEP
================================================================ */

function WorkflowStep({
  number,
  title,
  text,
  active = false,
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {number}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="text-xs text-slate-500 mt-1 leading-5">
          {text}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   MINI STAT
================================================================ */

function MiniStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>

      <p className="text-2xl font-black text-slate-900 mt-3">
        {value}
      </p>

      <p className="text-xs font-medium text-slate-500 mt-1">
        {label}
      </p>
    </div>
  );
}
