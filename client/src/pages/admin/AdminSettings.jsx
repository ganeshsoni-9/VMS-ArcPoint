import { useEffect, useState } from "react";
import api from "../../api/client.js";
import Layout from "../../components/Layout.jsx";
import Toast from "../../components/Toast.jsx";
import { useToast } from "../../hooks/useToast.js";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    api.get("/settings").then((res) => setSettings(res.data.data.settings));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await api.put("/settings", { retentionDays: settings.retentionDays, blacklistPolicy: settings.blacklistPolicy });
      setSettings(res.data.data.settings);
      showToast("Settings updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update settings", "error");
    }
  }

  if (!settings) return null;

  return (
    <Layout>
      <h1 className="text-lg font-semibold mb-4">Settings</h1>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl p-4 max-w-md space-y-4">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Data retention period (days)</label>
          <select
            value={settings.retentionDays}
            onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
          >
            {[30, 90, 180, 365].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Blacklist policy</label>
          <select
            value={settings.blacklistPolicy}
            onChange={(e) => setSettings({ ...settings, blacklistPolicy: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
          >
            <option value="flag">Flag registration (allow, warn)</option>
            <option value="block">Block registration</option>
          </select>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2">Save</button>
        <p className="text-xs text-gray-400">
          Automatic deletion of records older than the retention period is not implemented in this build — this
          setting is stored and documented, but no scheduled cleanup job runs yet.
        </p>
      </form>
      {toast && <Toast {...toast} onClose={clearToast} />}
    </Layout>
  );
}
