// Home.tsx - Full premium homepage with hero, deals, brands, best sellers, and more
import ProductCard from "../components/ProductCard/ProductCard";
import products from "../data/products.json";
import "./Home.css";

const featuredCategories = [
  { name: "CPU", icon: "🧠", value: "CPU" },
  { name: "GPU", icon: "🖥️", value: "GPU" },

  { name: "RAM", icon: "💾", value: "RAM" },
  { name: "SSD", icon: "💿", value: "SSD" },
  { name: "Laptops", icon: "💻", value: "Gaming Laptop" },
  { name: "Consoles", icon: "🎮", value: "Console" },
  { name: "Controllers", icon: "🕹️", value: "Controller" },
  { name: "Monitors", icon: "🖵", value: "Monitor" },
  { name: "Keyboards", icon: "⌨️", value: "Gaming Keyboard" },
  { name: "Mouse", icon: "🖱️", value: "Gaming Mouse" },
  { name: "Headsets", icon: "🎧", value: "Gaming Headset" },
  { name: "Chairs", icon: "🪑", value: "Gaming Chair" },
  { name: "Handhelds", icon: "📱", value: "Handheld Gaming" },
];

const topBrands = [
  "AMD", "Intel", "NVIDIA", "ASUS", "MSI", "Corsair", "Kingston",
  "Samsung", "LG", "Razer", "SteelSeries", "Logitech", "HyperX",
  "Sony", "Microsoft", "Nintendo", "Apple",
];

const whyChooseUs = [
  { icon: "🚚", title: "Free Shipping", desc: "On all orders, no minimum" },
  { icon: "🛡️", title: "Warranty Covered", desc: "Every product is warranty protected" },
  { icon: "🔒", title: "Secure Checkout", desc: "100% secure payment processing" },
  { icon: "↩️", title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: "💬", title: "24/7 Support", desc: "Always here when you need help" },
  { icon: "⚡", title: "Fast Delivery", desc: "3–5 business days nationwide" },
];

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Home({ setCurrentPage, setSelectedCategory }: HomeProps) {
  const featuredProducts = products.filter((p) => p.featured);
  const dealProducts = products.filter((p) => p.discount > 0 && p.stock > 0);
  const bestSellers = [...products].filter((p) => p.stock > 0).sort((a, b) => b.rating - a.rating).slice(0, 8);

  const handleCategoryClick = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage("products");
  };

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🎮 India&apos;s #1 Gaming Store</span>
          <h1>Build Your Dream<br /><span className="hero-accent">Gaming Setup</span></h1>
          <p className="hero-sub">CPUs, GPUs, Consoles, Gaming Accessories and More — all at the best prices with warranty and fast delivery.</p>
        </div>
      </section>

      {/* ===== GAMING CATEGORIES ===== */}
      <section className="section">
        <div className="section-header">
          <h2>Browse <span className="section-accent">Categories</span></h2>
          <p>Find exactly what you need for your gaming setup</p>
        </div>
        <div className="cat-grid">
          {featuredCategories.map((c) => (
            <div key={c.value} className="cat-card" onClick={() => handleCategoryClick(c.value)}>
              <span className="cat-card-icon">{c.icon}</span>
              <span className="cat-card-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED DEALS ===== */}
      {dealProducts.length > 0 && (
        <section className="section section-deals">
          <div className="section-header">
            <h2>🔥 Featured <span className="section-accent">Deals</span></h2>
            <p>Grab these before they&apos;re gone</p>
          </div>
          <div className="home-grid">
            {dealProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ===== TOP BRANDS ===== */}
      <section className="section section-brands">
        <div className="section-header">
          <h2>🏆 Top <span className="section-accent">Brands</span></h2>
          <p>We only carry the best in the industry</p>
        </div>
        <div className="brands-grid">
          {topBrands.map((b) => (
            <div key={b} className="brand-card">
              <span className="brand-name">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="section">
        <div className="section-header">
          <h2>⭐ Best <span className="section-accent">Sellers</span></h2>
          <p>Highest rated products by our customers</p>
        </div>
        <div className="home-grid">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ===== GAMING SETUP BANNER ===== */}
      <section className="setup-banner">
        <div className="setup-banner-content">
          <span className="setup-badge">🖥️ Complete Your Build</span>
          <h2>Build the Ultimate<br />Gaming Setup</h2>
          <p>From CPUs to Chairs — everything you need in one place</p>
          <button className="setup-btn btn-ripple" onClick={() => setCurrentPage("products")}>
            Browse All Products →
          </button>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section">
        <div className="section-header">
          <h2>🎯 Featured <span className="section-accent">Products</span></h2>
          <p>Handpicked top picks for gamers</p>
        </div>
        <div className="home-grid">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section section-why">
        <div className="section-header">
          <h2>💎 Why Choose <span className="section-accent">GameVault</span></h2>
          <p>Trusted by thousands of gamers across India</p>
        </div>
        <div className="why-grid">
          {whyChooseUs.map((w) => (
            <div key={w.title} className="why-card">
              <span className="why-icon">{w.icon}</span>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
