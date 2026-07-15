// ProductReviews.tsx — Display approved reviews for a product
import { useState, useEffect } from "react";
import { API_BASE } from "../context/ProductCatalogContext";

interface Review { id: number; userName: string; rating: number; comment: string; verified: boolean; createdAt: string }

interface Props { productId: number }

function ProductReviews({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/reviews/${productId}`).then(r => r.json()).then(setReviews).catch(() => {});
  }, [productId]);

  if (reviews.length === 0) return null;

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>⭐ Customer Reviews ({reviews.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ padding: "14px", background: "var(--gradient-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{r.userName}</span>
                {r.verified ? <span style={{ marginLeft: 6, fontSize: ".65rem", padding: "2px 6px", borderRadius: 3, background: "rgba(34,197,94,.12)", color: "#22c55e", fontWeight: 600 }}>✓ Verified Purchase</span> : null}
              </div>
              <span style={{ color: "#f59e0b", fontSize: ".8rem" }}>{stars(r.rating)}</span>
            </div>
            {r.comment && <p style={{ fontSize: ".84rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 4 }}>{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductReviews;
