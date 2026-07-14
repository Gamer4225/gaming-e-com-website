// Footer.tsx - Working navigation links + store info
import { LogoIcon, GitHubIcon } from "../Icons/Icons";
import "./Footer.css";

interface FooterProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function Footer({ setCurrentPage, setSelectedCategory }: FooterProps) {
  const go = (page: string, category?: string) => {
    if (category !== undefined) setSelectedCategory(category);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-brand">
            <LogoIcon size={40} title="GameVault" />
            <span>GameVault</span>
          </h4>
          <p>
            Your one-stop destination for gaming hardware, accessories, consoles, and PC
            components. Build your dream gaming setup with the best demo deals.
          </p>
          <div className="footer-social">
            <a
              className="footer-social-icon"
              href="https://github.com/Gamer4225/gaming-e-com-website"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="GitHub"
            >
              <GitHubIcon size={18} />
            </a>
            <span className="footer-social-icon" title="Instagram" aria-label="Instagram">◎</span>
            <span className="footer-social-icon" title="YouTube" aria-label="YouTube">▶</span>
            <span className="footer-social-icon" title="Discord" aria-label="Discord">◈</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => go("home")}>Home</button>
            <button type="button" className="footer-link" onClick={() => go("products", "All")}>Products</button>
            <button type="button" className="footer-link" onClick={() => go("products", "All")}>Categories</button>
            <button type="button" className="footer-link" onClick={() => go("wishlist")}>Wishlist</button>
            <button type="button" className="footer-link" onClick={() => go("orders")}>My Orders</button>
            <button type="button" className="footer-link" onClick={() => go("about")}>About</button>
          </div>
        </div>

        <div className="footer-section">
          <h4>Customer Support</h4>
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => go("contact")}>Contact Us</button>
            <button type="button" className="footer-link" onClick={() => go("faq")}>FAQ</button>
            <button type="button" className="footer-link" onClick={() => go("faq")}>Shipping Info</button>
            <button type="button" className="footer-link" onClick={() => go("faq")}>Returns &amp; Refunds</button>
            <button type="button" className="footer-link" onClick={() => go("orders")}>Track Order</button>
          </div>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => go("faq")}>Terms of Service</button>
            <button type="button" className="footer-link" onClick={() => go("faq")}>Privacy Policy</button>
            <button type="button" className="footer-link" onClick={() => go("about")}>About this demo</button>
            <button type="button" className="footer-link" onClick={() => go("faq")}>Warranty Policy</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          © 2026 <span>GameVault</span>. All rights reserved. | Academic Mini Project
        </div>
        <div className="footer-badges">
          <span className="footer-badge">🔒 Secure</span>
          <span className="footer-badge">🚚 Free Shipping</span>
          <span className="footer-badge">↩️ Easy Returns</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
