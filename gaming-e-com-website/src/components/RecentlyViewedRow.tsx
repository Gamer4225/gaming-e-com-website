// RecentlyViewedRow.tsx — Horizontal scroll of recently viewed products
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import ProductCard from "../components/ProductCard/ProductCard";
import "./RecentlyViewed.css";

interface Props { setCurrentPage: (p: string) => void }

function RecentlyViewedRow({ setCurrentPage }: Props) {
  const { viewedProducts, viewedIds } = useRecentlyViewed();
  if (viewedIds.length === 0) return null;

  return (
    <section className="section">
      <div className="section-header">
        <h2>🕐 Recently <span className="section-accent">Viewed</span></h2>
        <p>Pick up where you left off</p>
      </div>
      <div className="recently-viewed-scroll">
        {viewedProducts.slice(0, 6).map(p => (
          <div key={p.id} className="recently-viewed-card">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewedRow;
