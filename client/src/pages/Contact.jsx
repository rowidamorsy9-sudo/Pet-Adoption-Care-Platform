import React, { useState, useEffect } from "react";
import "./Contact.css";

const API = "http://localhost:4000/api/contact";

const faqs = [
    { q: "How long does the adoption process take?",   a: "Typically 3–7 business days after submitting your application, pending a home review." },
    { q: "Can I adopt if I live in an apartment?",     a: "Absolutely. Many of our cats and smaller dogs thrive in apartment settings." },
    { q: "What if the adoption doesn't work out?",     a: "We have a 30-day return policy — no questions asked. Your pet's wellbeing comes first." },
    { q: "Do you offer post-adoption support?",        a: "Yes! Our team is available via email and phone for advice on training, health, and settling in." },
];

function Contact() {
    const [form,    setForm]    = useState({ name: "", email: "", subject: "", message: "" });
    const [sent,    setSent]    = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [openFaq, setOpenFaq] = useState(null);

    // "My Messages" tab
    const [tab,      setTab]      = useState("form"); // "form" | "messages"
    const [myMsgs,   setMyMsgs]   = useState([]);
    const [msgsLoad, setMsgsLoad] = useState(false);
    const [msgsErr,  setMsgsErr]  = useState("");

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setApiError("");
    };

    // ── Submit contact form ────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.subject || !form.message) {
            setApiError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setApiError("");
        try {
            const res  = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setApiError(data.message || "Failed to send."); return; }
            setSent(true);
        } catch {
            setApiError("Cannot reach server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch user's own messages ──────────────────────────────────────────────
    const fetchMyMessages = async () => {
        setMsgsLoad(true);
        setMsgsErr("");
        try {
            const res  = await fetch(`${API}/my-messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { setMsgsErr(data.message || "Failed to load."); return; }
            setMyMsgs(Array.isArray(data) ? data : []);
        } catch {
            setMsgsErr("Cannot reach server.");
        } finally {
            setMsgsLoad(false);
        }
    };

    useEffect(() => {
        if (tab === "messages" && token) fetchMyMessages();
    }, [tab]);

    return (
        <div className="contact-page">
            {/* Hero */}
            <section className="contact-hero">
                <span className="contact-eyebrow">Get in Touch</span>
                <h1>We'd love to hear from you 💌</h1>
                <p>Questions, feedback, or just want to say hello — we're here.</p>
            </section>

            {/* Info cards */}
            <section className="contact-info">
                <div className="info-card"><span>📍</span><h3>Visit Us</h3><p>12 Nile Corniche, Garden City, Cairo, Egypt</p></div>
                <div className="info-card"><span>📞</span><h3>Call Us</h3><p>+20 100 123 4567</p><p>Mon–Fri, 9 am – 6 pm</p></div>
                <div className="info-card"><span>✉️</span><h3>Email Us</h3><p>hello@pawhome.eg</p><p>We reply within 24 h</p></div>
            </section>

            {/* Tab switcher — only shown for logged-in users */}
            {user && (
                <div className="contact-tabs">
                    <button className={`contact-tab-btn ${tab === "form" ? "active" : ""}`} onClick={() => setTab("form")}>
                        ✉️ Send a Message
                    </button>
                    <button className={`contact-tab-btn ${tab === "messages" ? "active" : ""}`} onClick={() => setTab("messages")}>
                        📬 My Messages
                    </button>
                </div>
            )}

            {/* Form + FAQ — or My Messages */}
            {tab === "form" ? (
                <section className="contact-main">
                    {/* Form */}
                    <div className="contact-form-wrap">
                        <h2>Send a Message</h2>
                        {sent ? (
                            <div className="success-msg">
                                <span>🎉</span>
                                <h3>Message sent!</h3>
                                <p>Thanks, {form.name}! We'll get back to you at {form.email} within 24 hours.</p>
                                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="contact-form">
                                {apiError && <div className="contact-error">{apiError}</div>}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@email.com" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subject *</label>
                                    <select name="subject" value={form.subject} onChange={handleChange} required>
                                        <option value="">Choose a topic…</option>
                                        <option value="adoption">Adoption enquiry</option>
                                        <option value="application">Application status</option>
                                        <option value="volunteer">Volunteering</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Tell us how we can help…" required />
                                </div>
                                <button type="submit" className="send-btn" disabled={loading}>
                                    {loading ? "Sending…" : "Send Message →"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* FAQ */}
                    <div className="contact-faq">
                        <h2>Frequently Asked</h2>
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <div className="faq-question">
                                    <span>{faq.q}</span>
                                    <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
                                </div>
                                {openFaq === i && <p className="faq-answer">{faq.a}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                /* My Messages tab */
                <section className="my-messages-section">
                    <h2>My Messages</h2>
                    {msgsErr  && <div className="contact-error">{msgsErr}</div>}
                    {msgsLoad ? (
                        <div className="msgs-loading"><div className="msgs-spinner" /><p>Loading…</p></div>
                    ) : myMsgs.length === 0 ? (
                        <div className="msgs-empty">
                            <span>📭</span>
                            <p>You haven't sent any messages yet.</p>
                        </div>
                    ) : (
                        <div className="msgs-list">
                            {myMsgs.map((msg) => (
                                <div key={msg._id} className="msg-card">
                                    <div className="msg-card-header">
                                        <div>
                                            <span className="msg-subject">{msg.subject}</span>
                                            <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                        </div>
                                        <span className={`msg-status-badge ${msg.status === "replied" ? "badge-replied" : "badge-unread"}`}>
                                            {msg.status === "replied" ? "✓ Replied" : "⏳ Pending"}
                                        </span>
                                    </div>

                                    <div className="msg-body">
                                        <p className="msg-original"><strong>Your message:</strong> {msg.message}</p>
                                        {msg.adminReply ? (
                                            <div className="msg-reply-box">
                                                <p className="msg-reply-label">🐾 Admin Reply:</p>
                                                <p className="msg-reply-text">{msg.adminReply}</p>
                                                <p className="msg-reply-date">Replied on {new Date(msg.repliedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                                            </div>
                                        ) : (
                                            <div className="msg-waiting">⏳ Waiting for admin reply…</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

export default Contact;
