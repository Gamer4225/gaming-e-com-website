// CompareProducts.tsx — Side-by-side gaming hardware comparison
import { useCompare } from "../context/CompareContext";
import ProductImage from "../components/ProductImage/ProductImage";
import "./StaticPages.css";
import "./Compare.css";

interface Props { setCurrentPage: (p: string) => void }

const SPEC_KEYS = ["Type","Cores / Threads","Base / Boost Clock","Cache","Socket","Architecture","TDP","Memory Support","VRAM","CUDA Cores","Memory Interface","Ray Tracing","Capacity","Speed","Latency","RGB","Form Factor","Resolution","Refresh Rate","Panel Type","Response Time","Connectivity","Sensor","DPI","Switch Type","Backlight","Wireless","Battery Life","Driver Size","Frequency Response","Microphone","Material","Weight Capacity","Recline","Armrests","Dimensions","Surface Area","Height Adjustable","Cable Management","Screen Size","Processor","Storage","Battery","GPU","Weight"];

function CompareProducts({ setCurrentPage }: Props) {
  const { compareProducts, removeCompare, clearCompare } = useCompare();

  if (compareProducts.length === 0) {
    return (
      <div className="static-page">
        <h1>⚖ Compare Products</h1>
        <div className="static-empty">
          <div className="static-empty-icon">📊</div>
          <h3>Nothing to compare</h3>
          <p>Click "Compare" on product cards to add up to 4 products for side-by-side comparison.</p>
          <button className="static-btn static-btn-primary" onClick={() => setCurrentPage("products")}>Browse Products</button>
        </div>
      </div>
    );
  }

  // Collect all unique spec keys
  const allKeys = new Set<string>();
  compareProducts.forEach(p => { if (p.specs) Object.keys(p.specs).forEach(k => allKeys.add(k)); });

  return (
    <div className="static-page static-page-wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>⚖ Compare Products</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: ".85rem" }}>{compareProducts.length} of 4 slots used</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="static-btn static-btn-secondary" onClick={clearCompare}>Clear All</button>
          <button className="static-btn static-btn-primary" onClick={() => setCurrentPage("products")}>+ Add More</button>
        </div>
      </div>

      <div className="compare-grid" style={{ marginTop: 20 }}>
        {/* Spec labels column */}
        <div className="compare-col compare-labels">
          <div className="compare-header">&nbsp;</div>
          <div className="compare-spec">Price</div>
          <div className="compare-spec">Brand</div>
          <div className="compare-spec">Category</div>
          <div className="compare-spec">Condition</div>
          <div className="compare-spec">Warranty</div>
          <div className="compare-spec">Rating</div>
          <div className="compare-spec">Stock</div>
          {/* Dynamic specs */}
          {[...allKeys].filter(k => !["Type","Condition","Warranty"].includes(k)).map(key => (
            <div key={key} className="compare-spec">{key}</div>
          ))}
        </div>

        {/* Product columns */}
        {compareProducts.map(p => (
          <div key={p.id} className="compare-col compare-product">
            <div className="compare-header">
              <button className="compare-remove" onClick={() => removeCompare(p.id)} title="Remove">✕</button>
              <ProductImage src={p.image} alt={p.name} />
              <div className="compare-name">{p.name}</div>
            </div>
            <div className="compare-spec highlight">₹{p.price?.toLocaleString("en-IN")}</div>
            <div className="compare-spec">{p.brand}</div>
            <div className="compare-spec">{p.category}</div>
            <div className="compare-spec">{p.condition === "New" ? "✅ New" : "♻️ Pre-Owned"}</div>
            <div className="compare-spec">{p.warranty}</div>
            <div className="compare-spec">{p.rating} ★</div>
            <div className="compare-spec">{p.stock > 0 ? `${p.stock} units` : "❌ Sold Out"}</div>
            {[...allKeys].filter(k => !["Type","Condition","Warranty"].includes(k)).map(key => (
              <div key={key} className="compare-spec">{p.specs?.[key] || "—"}</div>
            ))}
          </div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: 4 - compareProducts.length }).map((_, i) => (
          <div key={`empty-${i}`} className="compare-col compare-empty">
            <div className="compare-header">&nbsp;</div>
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>
              + Add product
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareProducts;
