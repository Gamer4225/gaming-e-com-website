import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminSettings({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const load = useCallback(() => { if (!token) return; adminFetch("/api/admin/settings", token).then(r => r.json()).then(setSettings); }, [token]);
  useEffect(() => { load(); }, [load]);
  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch("/api/admin/settings", token!, { method: "PUT", body: JSON.stringify(settings) });
    st("Settings saved!");
  };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const fields = [
    { key: "storeName", label: "Store Name", placeholder: "GameVault" },
    { key: "storeEmail", label: "Store Email", placeholder: "support@gamevault.com" },
    { key: "storePhone", label: "Store Phone", placeholder: "+91 98765 43210" },
    { key: "taxRate", label: "Tax Rate (%)", placeholder: "18" },
    { key: "currency", label: "Currency", placeholder: "INR" },
    { key: "lowStockThreshold", label: "Low Stock Threshold", placeholder: "5" },
  ];

  return (
    <div className="admin-body" style={{maxWidth:600}}>
      <h1>Settings</h1>
      <p className="lead">Configure your store</p>
      <div className="card">
        <form className="form" onSubmit={save}>
          {fields.map(f => (
            <div className="field" key={f.key}><label>{f.label}</label>
              <input value={settings[f.key] || ""} onChange={e => setSettings({...settings, [f.key]: e.target.value})} placeholder={f.placeholder} />
            </div>
          ))}
          <button className="btn btn-primary" type="submit">Save Settings</button>
        </form>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminSettings;
