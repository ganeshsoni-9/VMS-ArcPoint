import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import ErrorState from "../../components/ErrorState.jsx";
import { Clock, CheckCircle, XCircle, ArrowLeft, Building2 } from "lucide-react";

export default function RegisterStatus() {
  const { id } = useParams();
  const [registration, setRegistration] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    setState("loading");
    api
      .get(`/registrations/status/${id}`)
      .then((res) => {
        setRegistration(res.data.data.registration);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
              <CheckCircle size={28} />
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full">
              APPROVED
            </span>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <XCircle size={28} />
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full">
              REJECTED
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
              <Clock size={28} />
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
              PENDING APPROVAL
            </span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Registration Status</h1>
            <p className="text-xs text-gray-500">VMS Architecture Office</p>
          </div>
        </div>

        {state === "loading" && <LoadingSpinner label="Checking registration status..." />}
        {state === "error" && (
          <ErrorState message="Registration request not found or invalid ID." />
        )}

        {state === "success" && registration && (
          <div className="space-y-6">
            <div className="text-center">{getStatusBadge(registration.status)}</div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Registration ID:</span>
                <strong className="text-brand-700 font-mono">{registration.registrationId}</strong>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Applicant:</span>
                <span className="text-gray-900 font-medium">{registration.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900">{registration.email}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Requested Role:</span>
                <span className="capitalize font-semibold text-gray-800">
                  {registration.requestedRole}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Submitted At:</span>
                <span className="text-gray-700">
                  {new Date(registration.submittedAt).toLocaleString()}
                </span>
              </div>

              {registration.reviewedAt && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Reviewed At:</span>
                  <span className="text-gray-700">
                    {new Date(registration.reviewedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {registration.status === "REJECTED" && registration.rejectionReason && (
                <div className="pt-2 text-red-700 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                  Rejection Reason: {registration.rejectionReason}
                </div>
              )}

              {registration.status === "APPROVED" && (
                <div className="pt-2 text-green-700 font-medium bg-green-50 p-2 rounded-lg border border-green-100 text-center">
                  Your registration is approved! You can now log in.
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {registration.status === "APPROVED" ? (
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
                >
                  Proceed to Login
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2.5 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
