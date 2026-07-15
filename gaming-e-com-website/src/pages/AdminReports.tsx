import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../context/AdminContext";
import "./Admin.css";

interface Props { setCurrentPage: (p: string) => void }
function AdminReports({ setCurrentPage }: Props) {
  const { user, token } = useAuth();
  const [d, setD] = useState<any>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(() => { if (!token) return; adminFetch("/api/admin/reports/sales", token).then(r => r.json()).then(setD); }, [token]);
  useEffect(() => { load(); }, [load]);
  const st = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const exportCSV = () => {
    if (!d?.byCategory) return;
    const h = "Brand,Orders,Units Sold,Revenue\n";
    const rows = d.byCategory.map((c: any) => `"${c.category}",${c.orders},${c.units},${c.revenue}`).join("\n");
    const blob = new Blob([h + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "sales-report.csv"; a.click(); URL.revokeObjectURL(url);
    st("Report downloaded!");
  };

  if (!user || user.role !== "admin") return <div className="admin-body"><p>Access denied.</p></div>;
  if (!d) return <div className="admin-body"><p>Loading...</p></div>;

  return (
    <div className="admin-body">
      <div className="toolbar" style={{justifyContent:"space-between"}}>
        <h1 style={{margin:0}}>Sales Report</h1>
        <button className="btn btn-primary" onClick={exportCSV}>📥 Download Report</button>
      </div>
      <div className="stats-row">
        <div className="stat-card"><div className="icon-circle green">💰</div><div className="stat-info"><div className="value">₹{d.totalRevenue?.toLocaleString("en-IN")}</div><div className="label">Total Revenue</div></div></div>
        <div className="stat-card"><div className="icon-circle blue">📋</div><div className="stat-info"><div className="value">{d.totalOrders}</div><div className="label">Total Orders</div></div></div>
        <div className="stat-card"><div className="icon-circle purple">📊</div><div className="stat-info"><div className="value">₹{d.avgOrder?.toLocaleString("en-IN")}</div><div className="label">Avg Order Value</div></div></div>
      </div>
      <div className="card">
        <div className="card-header"><h2>Revenue by Brand</h2></div>
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Brand</th><th>Orders</th><th>Units Sold</th><th>Revenue</th></tr></thead>
          <tbody>{d.byCategory?.map((c: any) => (
            <tr key={c.category}><td style={{fontWeight:600}}>{c.category}</td><td>{c.orders}</td><td>{c.units}</td><td style={{fontWeight:600}}>₹{c.revenue?.toLocaleString("en-IN")}</td></tr>
          ))}</tbody>
        </table></div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
export default AdminReports;
