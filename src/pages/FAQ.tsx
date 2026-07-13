// FAQ.tsx - Expandable frequently asked questions
import { useState } from "react";
import "./StaticPages.css";

const FAQS = [
  {
    q: "Is this a real online store?",
    a: "GameVault is an academic mini-project / front-end demo. You can browse, cart, and complete a simulated checkout, but no real payment or shipment is processed.",
  },
  {
    q: "Do I need an account to buy?",
    a: "No. Checkout is guest-only. Your cart, wishlist, and recent orders are stored in this browser’s localStorage.",
  },
  {
    q: "Which payment methods work?",
    a: "Cash on Delivery, UPI (Demo), and Card (Demo). UPI and Card are simulated — nothing is charged.",
  },
  {
    q: "How does GST and shipping work?",
    a: "Cart and checkout apply 18% GST on the subtotal. Shipping is shown as FREE for all demo orders.",
  },
  {
    q: "What are Pre-Owned items?",
    a: "Pre-owned products are unique: quantity is locked to 1. Once added to cart (or purchased in this session), they may show as sold.",
  },
  {
    q: "Where can I see my past orders?",
    a: "Open My Orders from the navbar or footer. Up to 20 recent orders placed on this device are kept locally.",
  },
  {
    q: "Can I return a product?",
    a: "In a real store you’d follow returns policy. Here, returns are not processed — this is a UI demo only.",
  },
  {
    q: "Why do some product photos look generic?",
    a: "Images are free stock photos used for demonstration. They are not official manufacturer packaging shots.",
  },
];

interface FAQProps {
  setCurrentPage: (page: string) => void;
}

function FAQ({ setCurrentPage }: FAQProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="static-page">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>FAQ</h1>
      <p className="static-lead">Common questions about shopping on GameVault (demo store).</p>

      {FAQS.map((item, i) => (
        <div key={item.q} className="faq-item">
          <button
            className="faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.q}</span>
            <span>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}

      <div className="static-actions" style={{ marginTop: 20 }}>
        <button className="static-btn static-btn-primary" onClick={() => setCurrentPage("contact")}>
          Still need help? Contact
        </button>
      </div>
    </div>
  );
}

export default FAQ;
