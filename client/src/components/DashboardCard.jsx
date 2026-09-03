export default function DashboardCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
