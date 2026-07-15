// ReviewForm.tsx — Customer review submission on product detail
import { useState, type FormEvent } from "react";
import { API_BASE } from "../context/ProductCatalogContext";

interface Props { productId: number; productName: string; onSubmitted: () => void }

function ReviewForm({ productId, productName, onSubmitted }: Props) {
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{t:string;text:string}|null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || userName.trim().length < 2) { setMsg({t:"error",text:"Enter your name"}); return; }
    setSubmitting(true); setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim(), userName: userName.trim() }),
      });
      if (res.ok) {
        setMsg({t:"success",text:"Review submitted! It will appear after admin approval."});
        setComment(""); onSubmitted();
      } else {
        const d = await res.json();
        setMsg({t:"error",text: d.error || "Failed to submit"});
      }
    } catch { setMsg({t:"error",text:"Network error"}); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ marginTop: 24, padding: "20px", background: "var(--gradient-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      <h3 style={{ marginBottom: 12, fontSize: "1rem", fontWeight: 700 }}>📝 Write a Review for {productName}</h3>
      {msg && <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 10, fontSize: ".82rem", fontWeight: 600, background: msg.t==="success"?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)", color: msg.t==="success"?"#22c55e":"#ef4444" }}>{msg.text}</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Your name" style={{ flex: 1, minWidth: 150, padding: "10px 14px", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: ".88rem", outline: "none", fontFamily: "inherit" }} required />
          <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ padding: "10px 14px", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: ".88rem", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5-n)}</option>)}
          </select>
        </div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product..." style={{ padding: "10px 14px", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: ".88rem", outline: "none", minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
        <button type="submit" disabled={submitting} style={{ padding: "10px 20px", background: "var(--gradient-primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}>
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
