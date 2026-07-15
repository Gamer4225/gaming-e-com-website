import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminActivityLogs({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (search) p.set("q", search);
    adminFetch("/api/admin/activity-logs?" + p.toString(), token).then(r => r.json()).then(setLogs);
  }, [token, search]);
  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const icon = (action: string) => action.includes("created") || action.includes("added") ? "➕" : action.includes("deleted") ? "🗑️" : action.includes("updated") || action.includes("edited") ? "✏️" : "📝";

  return (
    <div className="admin-body">
      <div className="toolbar">
        <div className="search-box"><span className="icon">🔍</span><input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className="card">
        <div className="feed">
          {logs.map((l: any) => (
            <div key={l.id} className="feed-item">
              <span className="feed-time">{new Date(l.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              <span>{icon(l.action)} <strong>{l.userName}</strong> {l.action.replace(/_/g, " ")}</span>
              {l.details && <span style={{color:"var(--text-muted)",fontSize:".78rem"}}>{l.details}</span>}
            </div>
          ))}
          {!logs.length && <div className="feed-item" style={{color:"var(--text-muted)"}}>No activity logs yet.</div>}
        </div>
      </div>
    </div>
  );
}
export default AdminActivityLogs;
