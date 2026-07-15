import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";
interface Props { setCurrentPage: (p: string) => void }

function AdminChangePassword({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [cur, setCur] = useState(""); const [np, setNp] = useState(""); const [cf, setCf] = useState("");
  const [msg, setMsg] = useState<{t:string;text:string}|null>(null); const [sub, setSub] = useState(false);

  if (!user || !["admin","sub-admin","merchant","seller"].includes(user.role)) return <div className="admin-body"><p>Access denied.</p></div>;

  const handle = async (e: FormEvent) => {
    e.preventDefault(); setMsg(null);
    if (np !== cf) { setMsg({t:"error",text:"Passwords do not match"}); return; }
    if (np.length < 6) { setMsg({t:"error",text:"Min 6 characters"}); return; }
    setSub(true);
    try {
      const res = await adminFetch("/api/admin/change-password", token!, {method:"PUT",body:JSON.stringify({currentPassword:cur,newPassword:np})});
      const d = await res.json();
      if (!res.ok) { setMsg({t:"error",text:d.error}); return; }
      setMsg({t:"success",text:"Password changed!"}); setCur(""); setNp(""); setCf("");
    } catch { setMsg({t:"error",text:"Network error"}); } finally { setSub(false); }
  };

  return (
    <div className="admin-body" style={{maxWidth:480}}>
      <div className="card">
        <div className="card-header"><h2>Change Password</h2></div>
        <form className="form" onSubmit={handle}>
          {msg && <div style={{padding:"10px 14px",borderRadius:8,fontSize:".84rem",fontWeight:600,background:msg.t==="success"?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)",color:msg.t==="success"?"var(--success)":"var(--danger)"}}>{msg.text}</div>}
          <div className="field"><label>Current Password</label><input type="password" value={cur} onChange={e => setCur(e.target.value)} required /></div>
          <div className="field"><label>New Password</label><input type="password" value={np} onChange={e => setNp(e.target.value)} placeholder="Min 6 chars" required /></div>
          <div className="field"><label>Confirm New Password</label><input type="password" value={cf} onChange={e => setCf(e.target.value)} required /></div>
          <button className="btn btn-primary" type="submit" disabled={sub}>{sub?"Updating...":"Change Password"}</button>
        </form>
      </div>
    </div>
  );
}
export default AdminChangePassword;
