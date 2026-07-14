// AdminUsers.tsx — View all registered users
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface AdminUser { id: number; name: string; email: string; phone: string; role: string; createdAt: string }

interface AdminUsersProps { setCurrentPage: (p: string) => void }

function AdminUsers({ setCurrentPage }: AdminUsersProps) {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminFetch("/api/admin/users", token)
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [token]);

  if (!user || user.role !== "admin") return <div className="admin-page"><p>Access denied.</p></div>;
  if (loading) return <div className="admin-page"><p>Loading users...</p></div>;

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => setCurrentPage("admin-dashboard")}>← Back to Dashboard</button>
      <h1>Registered Users</h1>
      <p className="admin-lead">{users.length} users registered</p>
      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td><span className={`admin-badge ${u.role === "admin" ? "admin-badge-info" : "admin-badge-success"}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
