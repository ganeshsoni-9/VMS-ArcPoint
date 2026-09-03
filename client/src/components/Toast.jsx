import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = type === "error" ? "bg-red-600" : "bg-gray-900";

  return (
    <div className={`fixed bottom-4 right-4 ${color} text-white text-sm px-4 py-3 rounded-lg shadow-lg z-50`}>
      {message}
    </div>
  );
}
