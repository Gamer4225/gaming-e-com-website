// Login.tsx
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

interface LoginProps { setCurrentPage: (page: string) => void }

function Login({ setCurrentPage }: LoginProps) {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect staff users immediately once user state is available
  useEffect(() => {
    if (!user) return;
    const staffRoles = ["admin", "sub-admin", "merchant"];
    if (staffRoles.includes(user.role)) {
      const dash = user.role === "admin" ? "admin-dashboard" : user.role === "sub-admin" ? "sub-dashboard" : "merchant-dashboard";
      setCurrentPage(dash);
    }
  }, [user, setCurrentPage]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      // redirect handled by useEffect above once user state populates
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-lead">Log in to GameVault to track orders and checkout faster.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          </label>
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          New here?
          <button type="button" onClick={() => setCurrentPage("signup")}>Create an account</button>
        </p>
        <p className="auth-note">
          Accounts are stored in the GameVault SQLite database on the mini backend. Demo only — use a password you don&apos;t use elsewhere.
        </p>
      </div>
    </div>
  );
}

export default Login;
