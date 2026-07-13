// Contact.tsx - Contact form (demo, no backend email)
import { useState, type FormEvent } from "react";
import "./StaticPages.css";

interface ContactProps {
  setCurrentPage: (page: string) => void;
}

function Contact({ setCurrentPage }: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General inquiry");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email";
    if (message.trim().length < 10) next.message = "Message should be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Demo only — store last message locally so the form feels real
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        at: new Date().toISOString(),
      };
      localStorage.setItem("gamevault_last_contact", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setSubject("General inquiry");
  };

  return (
    <div className="static-page">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>Contact Us</h1>
      <p className="static-lead">
        Questions about orders, products, or this mini project? Send a message — demo form only
        (saved in your browser, no email is sent).
      </p>

      <div className="static-grid-2">
        <div className="static-card">
          <h2>Store info</h2>
          <div className="contact-info-row"><strong>Brand</strong><span>GameVault</span></div>
          <div className="contact-info-row"><strong>Email</strong><span>support@gamevault.demo</span></div>
          <div className="contact-info-row"><strong>Phone</strong><span>+91 98765 43210</span></div>
          <div className="contact-info-row"><strong>Hours</strong><span>Mon–Sat, 10:00–19:00 IST</span></div>
          <div className="contact-info-row"><strong>Location</strong><span>Surat, Gujarat, India (demo)</span></div>
          <p style={{ marginTop: 14 }}>
            For order status, open <button className="static-back" style={{ display: "inline", margin: 0 }} onClick={() => setCurrentPage("orders")}>My Orders</button> —
            recent checkouts on this device are listed there.
          </p>
        </div>

        <div className="static-card">
          <h2>Send a message</h2>
          {sent && (
            <div className="static-success">
              Thanks! Your message was saved locally (demo). We&apos;ll pretend to get back soon.
            </div>
          )}
          <form className="static-form" onSubmit={handleSubmit} noValidate>
            <label className="static-field">
              <span>Name *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              {errors.name && <em className="static-error">{errors.name}</em>}
            </label>
            <label className="static-field">
              <span>Email *</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              {errors.email && <em className="static-error">{errors.email}</em>}
            </label>
            <label className="static-field">
              <span>Subject</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option>General inquiry</option>
                <option>Order help</option>
                <option>Product question</option>
                <option>Feedback</option>
              </select>
            </label>
            <label className="static-field">
              <span>Message *</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
              {errors.message && <em className="static-error">{errors.message}</em>}
            </label>
            <button type="submit" className="static-submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
