import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }

function AdminUsers({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { if (!token) return; adminFetch("/api/admin/customers", token).then(r => r.json()).then(setUsers); }, [token]);
  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  return (
    <div className="admin-body">
      <div className="card"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id}><td>{u.id}</td><td style={{fontWeight:600}}>{u.name}</td><td>{u.email}</td><td>{u.phone||"—"}</td>
            <td><span className={`badge ${u.role==="admin"?"badge-purple":u.role==="sub-admin"?"badge-blue":u.role==="merchant"?"badge-orange":u.role==="seller"?"badge-green":"badge-blue"}`}>{u.role}</span></td>
            <td>{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td></tr>
        ))}</tbody>
      </table></div></div>
    </div>
  );
}
export default AdminUsers;
