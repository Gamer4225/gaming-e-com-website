// Home.tsx - Full premium homepage with hero, deals, brands, best sellers, and more
import { useMemo, type ReactNode } from "react";
import ProductCard from "../components/ProductCard/ProductCard";
import BrandMarquee from "../components/BrandMarquee/BrandMarquee";
import { useProductCatalog } from "../context/ProductCatalogContext";
import {
  CategoryIcon,
  TruckIcon,
  ShieldIcon,
  LockIcon,
  ReturnIcon,
  ChatIcon,
  BoltIcon,
} from "../components/Icons/Icons";
import { getBrandLogo, brandNeedsLightPlate } from "../assets/brandLogos";
import "./Home.css";

const featuredCategories = [
  { name: "CPU", value: "CPU" },
  { name: "GPU", value: "GPU" },
  { name: "RAM", value: "RAM" },
  { name: "SSD", value: "SSD" },
  { name: "Cabinets", value: "PC Cabinet" },
  { name: "Laptops", value: "Gaming Laptop" },
  { name: "Consoles", value: "Console" },
  { name: "Controllers", value: "Controller" },
  { name: "Monitors", value: "Monitor" },
  { name: "Keyboards", value: "Gaming Keyboard" },
  { name: "Mouse", value: "Gaming Mouse" },
  { name: "Headsets", value: "Gaming Headset" },
  { name: "Chairs", value: "Gaming Chair" },
  { name: "Handhelds", value: "Handheld Gaming" },
];

const topBrands = [
  "AMD", "Intel", "NVIDIA", "ASUS", "MSI", "Corsair", "Kingston",
  "Samsung", "LG", "Razer", "SteelSeries", "Logitech", "HyperX",
  "Sony", "Microsoft", "Nintendo", "Apple",
];

const whyChooseUs: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <TruckIcon size={28} />, title: "Free Shipping", desc: "On all orders, no minimum" },
  { icon: <ShieldIcon size={28} />, title: "Warranty Covered", desc: "Every product is warranty protected" },
  { icon: <LockIcon size={28} />, title: "Secure Checkout", desc: "100% secure payment processing" },
  { icon: <ReturnIcon size={28} />, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: <ChatIcon size={28} />, title: "24/7 Support", desc: "Always here when you need help" },
  { icon: <BoltIcon size={28} />, title: "Fast Delivery", desc: "3–5 business days nationwide" },
];

interface HomeProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery?: (q: string) => void;
}

function Home({ setCurrentPage, setSelectedCategory, setSearchQuery }: HomeProps) {
  const { products } = useProductCatalog();
  const dealProducts = products.filter((p) => p.discount > 0 && p.stock > 0);
  const bestSellers = [...products]
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const handleCategoryClick = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage("products");
  };

  const handleBrandClick = (brand: string) => {
    setSelectedCategory("All");
    setSearchQuery?.(brand);
    setCurrentPage("products");
  };

  // Circular horizontal logo strip (right → left, seamless loop)
  const brandMarqueeItems = useMemo(
    () =>
      topBrands.map((brand) => ({
        name: brand,
        logo: getBrandLogo(brand),
        logoLightPlate: brandNeedsLightPlate(brand),
        onSelect: () => handleBrandClick(brand),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSearchQuery, setSelectedCategory, setCurrentPage]
  );

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Build Your Dream
            <br />
            <span className="hero-accent">Gaming Setup</span>
          </h1>
          <p className="hero-sub">
            CPUs, GPUs, Consoles, Gaming Accessories and More — all at the best prices with
            warranty and fast delivery.
          </p>
        </div>
      </section>

      {/* ===== GAMING CATEGORIES ===== */}
      <section className="section">
        <div className="section-header">
          <h2>
            Browse <span className="section-accent">Categories</span>
          </h2>
          <p>Find exactly what you need for your gaming setup</p>
        </div>
        <div className="cat-grid">
          {featuredCategories.map((c) => (
            <div key={c.value} className="cat-card" onClick={() => handleCategoryClick(c.value)}>
              <span className="cat-card-icon">
                <CategoryIcon category={c.value} size={26} />
              </span>
              <span className="cat-card-name">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED DEALS ===== */}
      {dealProducts.length > 0 && (
        <section className="section section-deals">
          <div className="section-header">
            <h2>
              Featured <span className="section-accent">Deals</span>
            </h2>
            <p>Grab these before they&apos;re gone</p>
          </div>
          <div className="home-grid">
            {dealProducts.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ===== TOP BRANDS — circular right→left logo marquee ===== */}
      <section className="section section-brands">
        <div className="section-header">
          <h2>
            Top <span className="section-accent">Brands</span>
          </h2>
          <p>Logos travel right to left in a loop · click any brand to shop</p>
        </div>
        <BrandMarquee items={brandMarqueeItems} speed={28} pauseOnHover />
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="section">
        <div className="section-header">
          <h2>
            Best <span className="section-accent">Sellers</span>
          </h2>
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
          <span className="setup-badge">Complete Your Build</span>
          <h2>
            Build the Ultimate
            <br />
            Gaming Setup
          </h2>
          <p>From CPUs to Chairs — everything you need in one place</p>
          <button className="setup-btn btn-ripple" onClick={() => setCurrentPage("products")}>
            Browse All Products →
          </button>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section section-why">
        <div className="section-header">
          <h2>
            Why Choose <span className="section-accent">GameVault</span>
          </h2>
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
