// Footer.tsx - Site footer with links, social icons, and copyright
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🎮 GameVault</h4>
          <p>Your one-stop destination for gaming hardware, accessories, consoles, and PC components. Build your dream gaming setup with the best deals.</p>
          <div className="footer-social">
            <span className="footer-social-icon">📘</span>
            <span className="footer-social-icon">🐦</span>
            <span className="footer-social-icon">📸</span>
            <span className="footer-social-icon">🎥</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <div className="footer-links">
            <span className="footer-link">Home</span>
            <span className="footer-link">Products</span>
            <span className="footer-link">Categories</span>
            <span className="footer-link">Deals &amp; Offers</span>
            <span className="footer-link">New Arrivals</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>Customer Support</h4>
          <div className="footer-links">
            <span className="footer-link">Contact Us</span>
            <span className="footer-link">FAQ</span>
            <span className="footer-link">Shipping Info</span>
            <span className="footer-link">Returns &amp; Refunds</span>
            <span className="footer-link">Track Order</span>
          </div>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <div className="footer-links">
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Cookie Policy</span>
            <span className="footer-link">Warranty Policy</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">© 2025 <span>GameVault</span>. All rights reserved. | Academic Mini Project</div>
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
