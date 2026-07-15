// Signup.tsx
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

interface SignupProps {
  setCurrentPage: (page: string) => void;
}

function Signup({ setCurrentPage }: SignupProps) {
  const { signup, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("customer");
  const [brand, setBrand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Enter your full name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
        brand: brand.trim() || undefined,
      });
      setCurrentPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => setCurrentPage("home")}>
        ← Back to Home
      </button>
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-lead">Sign up to save your profile and place orders on GameVault.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dev Mehta"
              autoComplete="name"
              required
            />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span>Phone (optional)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              autoComplete="tel"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </label>
          {user?.role === "admin" && (
            <>
              <label className="auth-field"><span>Account Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{padding:"12px 14px",background:"var(--bg-tertiary)",border:"1px solid var(--border-color)",borderRadius:"var(--radius-sm)",color:"var(--text-primary)",fontSize:".95rem",outline:"none",fontFamily:"inherit"}}>
                  <option value="customer">Customer</option>
                  <option value="sub-admin">Sub-Admin</option>
                  <option value="merchant">Merchant</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
              {role === "merchant" && (
                <label className="auth-field"><span>Brand Name</span><input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. ASUS, Corsair" /></label>
              )}
            </>
          )}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?
          <button type="button" onClick={() => setCurrentPage("login")}>
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
