const COLORS = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  INSIDE: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  DENIED: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${COLORS[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}
