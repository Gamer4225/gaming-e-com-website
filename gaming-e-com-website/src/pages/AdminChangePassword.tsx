// AdminChangePassword.tsx — Change admin password
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void; activePage: string }

function AdminChangePassword({ setCurrentPage, activePage }: Props) {
  const { user, token } = useAuth();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ t: string; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (newPass !== confirm) { setMsg({ t: "error", text: "Passwords do not match" }); return; }
    if (newPass.length < 6) { setMsg({ t: "error", text: "Min 6 characters" }); return; }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/change-password", token!, { method: "PUT", body: JSON.stringify({ currentPassword: current, newPassword: newPass }) });
      const d = await res.json();
      if (!res.ok) { setMsg({ t: "error", text: d.error }); return; }
      setMsg({ t: "success", text: "Password changed!" }); setCurrent(""); setNewPass(""); setConfirm("");
    } catch { setMsg({ t: "error", text: "Network error" }); } finally { setSubmitting(false); }
  };

  return (
    <div className="admin-body" style={{ maxWidth: 480 }}>
      <h1>Change Password</h1>
      <p className="lead">Update your admin password.</p>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          {msg && <div style={{ padding: "10px", borderRadius: 6, fontSize: ".82rem", fontWeight: 600, background: msg.t === "success" ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)", color: msg.t === "success" ? "#22c55e" : "#ef4444" }}>{msg.text}</div>}
          <div className="field"><label>Current Password</label><input type="password" value={current} onChange={e => setCurrent(e.target.value)} required /></div>
          <div className="field"><label>New Password</label><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 chars" required /></div>
          <div className="field"><label>Confirm New Password</label><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
          <button className="btn btn-prim" type="submit" disabled={submitting}>{submitting ? "Updating..." : "Change Password"}</button>
        </form>
      </div>
    </div>
  );
}

export default AdminChangePassword;
