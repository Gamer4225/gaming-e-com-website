// About.tsx - Project / store about page
import "./StaticPages.css";

interface AboutProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function About({ setCurrentPage, setSelectedCategory }: AboutProps) {
  return (
    <div className="static-page">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>About GameVault</h1>
      <p className="static-lead">
        GameVault is an academic mini-project e-commerce storefront for gaming hardware,
        accessories, consoles, and PC components — built as a front-end demo with a full
        browse → cart → checkout experience.
      </p>

      <div className="static-card">
        <h2>Our mission</h2>
        <p>
          Make building a gaming setup simple: browse clear categories, compare options with
          filters, and complete a guest checkout without creating an account. This project
          focuses on UI/UX and client-side e-commerce flows rather than a live payment backend.
        </p>
      </div>

      <div className="static-card">
        <h2>What you can do here</h2>
        <ul>
          <li>Browse 260+ demo products across CPUs, GPUs, peripherals, furniture, and more</li>
          <li>Filter by brand (category-aware), price, rating, stock, warranty, and condition</li>
          <li>Add items to cart with stock-aware quantities and pre-owned unique-item rules</li>
          <li>Save favourites to a wishlist (stored in your browser)</li>
          <li>Complete guest checkout with address + demo payment methods</li>
          <li>View order confirmation and order history saved locally on this device</li>
        </ul>
      </div>

      <div className="static-card">
        <h2>Tech stack</h2>
        <ul>
          <li>React 19 + TypeScript</li>
          <li>Vite (single-file production build)</li>
          <li>Custom dark neon CSS (GameVault theme)</li>
          <li>React Context + localStorage for cart, wishlist, and orders</li>
        </ul>
      </div>

      <div className="static-card">
        <h2>Demo notice</h2>
        <p>
          Payments are simulated (COD / UPI / Card demo). No real charges, shipping, or
          emails are processed. Product images are stock photos for demonstration only.
        </p>
      </div>

      <div className="static-actions">
        <button
          className="static-btn static-btn-primary"
          onClick={() => {
            setSelectedCategory("All");
            setCurrentPage("products");
          }}
        >
          Browse Products
        </button>
        <button className="static-btn static-btn-secondary" onClick={() => setCurrentPage("contact")}>
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default About;
