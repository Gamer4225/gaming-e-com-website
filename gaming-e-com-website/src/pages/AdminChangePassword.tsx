// AdminChangePassword.tsx — Admin changes their own password
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface AdminChangePasswordProps { setCurrentPage: (p: string) => void }

function AdminChangePassword({ setCurrentPage }: AdminChangePasswordProps) {
  const { user, token } = useAuth();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role !== "admin") return <div className="admin-page"><p>Access denied.</p></div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (newPass !== confirm) { setMsg({ type: "error", text: "Passwords do not match" }); return; }
    if (newPass.length < 6) { setMsg({ type: "error", text: "New password must be at least 6 characters" }); return; }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/change-password", token!, { method: "PUT", body: JSON.stringify({ currentPassword: current, newPassword: newPass }) });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: "error", text: data.error || "Failed" }); return; }
      setMsg({ type: "success", text: "Password changed successfully!" });
      setCurrent(""); setNewPass(""); setConfirm("");
    } catch {
      setMsg({ type: "error", text: "Network error" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => setCurrentPage("admin-dashboard")}>← Back to Dashboard</button>
      <div style={{ maxWidth: 440 }}>
        <h1>Change Password</h1>
        <p className="admin-lead">Update your admin account password.</p>
        <div className="admin-section">
          <form className="admin-form" onSubmit={handleSubmit}>
            {msg && <div style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", fontSize: ".85rem", fontWeight: 600, background: msg.type === "success" ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", color: msg.type === "success" ? "#22c55e" : "#ef4444", border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,.3)" : "rgba(239,68,68,.3)"}` }}>{msg.text}</div>}
            <div className="admin-field"><label>Current Password</label><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required /></div>
            <div className="admin-field"><label>New Password</label><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Min 6 characters" required /></div>
            <div className="admin-field"><label>Confirm New Password</label><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
            <button className="admin-btn admin-btn-primary" type="submit" disabled={submitting}>{submitting ? "Updating..." : "Change Password"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminChangePassword;
