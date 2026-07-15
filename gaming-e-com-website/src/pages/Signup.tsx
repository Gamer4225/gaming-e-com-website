import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

interface SignupProps { setCurrentPage: (page: string) => void }

function Signup({ setCurrentPage }: SignupProps) {
  const { signup, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountType, setAccountType] = useState("customer");
  const [brand, setBrand] = useState("");

  const roleLabels: Record<string, { icon: string; desc: string }> = {
    customer: { icon: "👤", desc: "Browse, buy, wishlist — standard shopping account" },
    seller: { icon: "🛒", desc: "Sell pre-owned gaming gear and buy products" },
    merchant: { icon: "🏪", desc: "Manage your brand's products and track sales" },
    "sub-admin": { icon: "🔧", desc: "Manage products, orders, and store operations" },
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null);
    if (name.trim().length < 2) { setError("Enter your full name"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setSubmitting(true);
    try {
      const result: any = await signup({
        name: name.trim(), email: email.trim(), phone: phone.trim() || undefined,
        password, role: accountType, brand: brand.trim() || undefined,
      });
      const r = result?.role || "customer";
      setCurrentPage(r === "admin" ? "admin-dashboard" : r === "sub-admin" ? "sub-dashboard" : r === "merchant" ? "merchant-dashboard" : r === "seller" ? "seller-dashboard" : "home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally { setSubmitting(false); }
  };

  const isAdmin = user?.role === "admin";
  const showRolePicker = isAdmin;
  const showBrandField = accountType === "merchant";

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-lead">Join GameVault — one email, one account.</p>

        {showRolePicker && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Account Type (Admin only)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(roleLabels).map(([role, { icon, desc }]) => (
                <div key={role} onClick={() => setAccountType(role)}
                  style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: `1px solid ${accountType === role ? "var(--color-primary)" : "var(--border-color)"}`, background: accountType === role ? "rgba(0,191,255,.06)" : "var(--bg-tertiary)", transition: "all .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight: 700, fontSize: ".82rem", color: "var(--text-primary)" }}>{role === "sub-admin" ? "Sub-Admin" : role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                  <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-field"><span>Full Name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Dev Mehta" autoComplete="name" required /></label>
          <label className="auth-field"><span>Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label className="auth-field"><span>Phone (optional)</span><input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" autoComplete="tel" /></label>
          {showBrandField && <label className="auth-field"><span>Brand Name</span><input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. ASUS, Corsair" /></label>}
          <label className="auth-field"><span>Password</span><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" required /></label>
          <label className="auth-field"><span>Confirm Password</span><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password" required /></label>
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Creating..." : `Create ${showRolePicker ? roleLabels[accountType]?.icon + " " + accountType.charAt(0).toUpperCase() + accountType.slice(1) : "Customer"} Account`}</button>
        </form>

        <p className="auth-switch">Already have an account? <button type="button" onClick={() => setCurrentPage("login")}>Log in</button></p>
        {!isAdmin && <p className="auth-note" style={{ marginTop: 8 }}>You're creating a <strong>Customer</strong> account. Admin users can create other account types.</p>}
      </div>
    </div>
  );
}
export default Signup;
