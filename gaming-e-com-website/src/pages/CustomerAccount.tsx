// CustomerAccount.tsx — Profile + change password for customers
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Auth.css";

interface Props { setCurrentPage: (p: string) => void }

function CustomerAccount({ setCurrentPage }: Props) {
  const { user, token, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ t: string; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <div className="auth-page"><p>Please login.</p></div>;

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setMsg(null);
    try {
      const res = await adminFetch("/api/customer/profile", token!, { method: "PUT", body: JSON.stringify({ name, phone }) });
      const d = await res.json();
      if (res.ok) setMsg({ t: "success", text: "Profile updated!" });
      else setMsg({ t: "error", text: d.error });
    } catch { setMsg({ t: "error", text: "Network error" }); }
    finally { setSubmitting(false); }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (newPass !== confirm) { setMsg({ t: "error", text: "Passwords do not match" }); return; }
    if (newPass.length < 6) { setMsg({ t: "error", text: "Min 6 characters" }); return; }
    setSubmitting(true);
    try {
      const res = await adminFetch("/api/customer/change-password", token!, { method: "PUT", body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }) });
      const d = await res.json();
      if (res.ok) { setMsg({ t: "success", text: "Password changed!" }); setCurPass(""); setNewPass(""); setConfirm(""); }
      else setMsg({ t: "error", text: d.error });
    } catch { setMsg({ t: "error", text: "Network error" }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="auth-card">
          <h1>My Account</h1>
          <p className="auth-lead">{user.email} · {user.role}</p>
          {msg && <div style={{ padding: "10px", borderRadius: 6, fontSize: ".82rem", fontWeight: 600, marginBottom: 10, background: msg.t === "success" ? "rgba(34,197,94,.08)" : "rgba(239,68,68,.08)", color: msg.t === "success" ? "#22c55e" : "#ef4444" }}>{msg.text}</div>}
          <form className="auth-form" onSubmit={handleProfile}>
            <label className="auth-field"><span>Name</span><input value={name} onChange={e => setName(e.target.value)} /></label>
            <label className="auth-field"><span>Phone</span><input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} /></label>
            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Update Profile"}</button>
          </form>
        </div>
        <div className="auth-card">
          <h1>Change Password</h1>
          <form className="auth-form" onSubmit={handlePassword}>
            <label className="auth-field"><span>Current Password</span><input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} /></label>
            <label className="auth-field"><span>New Password</span><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 chars" /></label>
            <label className="auth-field"><span>Confirm Password</span><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
            <button className="auth-submit" type="submit" disabled={submitting}>Change Password</button>
          </form>
        </div>
        <button className="auth-submit" style={{ background: "var(--color-danger)" }} onClick={() => { logout(); setCurrentPage("home"); }}>Logout</button>
      </div>
    </div>
  );
}

export default CustomerAccount;
