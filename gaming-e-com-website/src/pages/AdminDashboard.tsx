// AdminDashboard.tsx — Overview stats, category breakdown, recent orders
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  outOfStock: number;
  lowStock: number;
  totalRevenue: number;
  catStats: { category: string; total: number; outOfStock: number }[];
  recentOrders: { orderId: string; grandTotal: number; placedAt: string }[];
}

interface AdminDashboardProps { setCurrentPage: (p: string) => void }

function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminFetch("/api/admin/stats", token)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!user || user.role !== "admin") {
    return <div className="admin-page"><p>Access denied. Admin only.</p></div>;
  }

  if (loading || !stats) return <div className="admin-page"><p>Loading dashboard...</p></div>;

  return (
    <div className="admin-page">
      <button className="admin-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>Admin Dashboard</h1>
      <p className="admin-lead">Welcome, {user.name}. Here's your store overview.</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-value">₹{(stats.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="admin-stat-card warn">
          <div className="stat-value">{stats.lowStock}</div>
          <div className="stat-label">Low Stock (≤3)</div>
        </div>
        <div className="admin-stat-card danger">
          <div className="stat-value">{stats.outOfStock}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="admin-section">
        <h2>Category Breakdown</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Category</th><th>Total</th><th>Out of Stock</th></tr></thead>
            <tbody>
              {stats.catStats.map((c) => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td>{c.total}</td>
                  <td>{c.outOfStock > 0 ? <span className="admin-badge admin-badge-danger">{c.outOfStock}</span> : "0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Recent Orders</h2>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setCurrentPage("admin-orders")}>View All →</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Amount</th><th>Placed</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.orderId}>
                  <td style={{ fontFamily: "monospace" }}>{o.orderId}</td>
                  <td>₹{o.grandTotal.toLocaleString("en-IN")}</td>
                  <td>{new Date(o.placedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && <tr><td colSpan={3} style={{ color: "var(--text-muted)" }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="admin-btn admin-btn-primary" onClick={() => setCurrentPage("admin-products")}>Manage Products</button>
          <button className="admin-btn admin-btn-secondary" onClick={() => setCurrentPage("admin-orders")}>View All Orders</button>
          <button className="admin-btn admin-btn-secondary" onClick={() => setCurrentPage("admin-users")}>View Users</button>
          <button className="admin-btn admin-btn-secondary" onClick={() => setCurrentPage("admin-password")}>Change Password</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
