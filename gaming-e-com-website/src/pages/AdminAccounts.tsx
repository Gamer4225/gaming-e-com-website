import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
const ROLES = ["All", "admin", "sub-admin", "merchant", "seller", "customer"];

function AdminAccounts({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState("All");

  const load = useCallback(() => {
    if (!token) return;
    const p = new URLSearchParams(); if (roleFilter !== "All") p.set("role", roleFilter);
    adminFetch("/api/admin/accounts?" + p.toString(), token).then(r => r.json()).then(setAccounts);
  }, [token, roleFilter]);
  useEffect(() => { load(); }, [load]);

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;

  const counts: Record<string, number> = {};
  accounts.forEach(a => { counts[a.role] = (counts[a.role] || 0) + 1; });

  return (
    <div className="admin-body">
      <div className="stats-row">
        {["admin","sub-admin","merchant","seller","customer"].map(r => (
          <div key={r} className="stat-card" onClick={() => setRoleFilter(r)} style={{cursor:"pointer"}}>
            <div className={`icon-circle ${r==="admin"?"purple":r==="sub-admin"?"blue":r==="merchant"?"orange":r==="seller"?"green":"blue"}`}>
              {r==="admin"?"👑":r==="sub-admin"?"🔧":r==="merchant"?"🏪":r==="seller"?"🛒":"👤"}
            </div>
            <div className="stat-info"><div className="value">{counts[r] || 0}</div><div className="label">{r.charAt(0).toUpperCase()+r.slice(1)}</div></div>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div className="select-box"><select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>{ROLES.map(r => <option key={r}>{r === "All" ? "All Roles" : r.charAt(0).toUpperCase()+r.slice(1)}</option>)}</select></div>
      </div>
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Brand</th><th>Joined</th></tr></thead>
        <tbody>{accounts.map(a => (
          <tr key={a.id}><td>{a.id}</td><td style={{fontWeight:600}}>{a.name}</td><td>{a.email}</td><td>{a.phone || "—"}</td>
            <td><span className={`badge ${a.role==="admin"?"badge-purple":a.role==="sub-admin"?"badge-blue":a.role==="merchant"?"badge-orange":a.role==="seller"?"badge-green":"badge-blue"}`}>{a.role}</span></td>
            <td>{a.brand || "—"}</td>
            <td>{new Date(a.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
}
export default AdminAccounts;
