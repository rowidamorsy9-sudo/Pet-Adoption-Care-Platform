import React from "react";
import "./About.css";

const stats = [
    { value: "1,200+", label: "Pets Rehomed" },
    { value: "850+", label: "Happy Families" },
    { value: "40+", label: "Shelter Partners" },
    { value: "98%", label: "Satisfaction Rate" },
];

const team = [
    { name: "Sara Khalil", role: "Founder & Director", emoji: "👩‍💼" },
    { name: "Ahmed Nour", role: "Veterinary Advisor", emoji: "👨‍⚕️" },
    { name: "Lina Hassan", role: "Adoption Coordinator", emoji: "👩‍🔬" },
    { name: "Omar Faris", role: "Community Manager", emoji: "👨‍💻" },
];

const values = [
    {
        icon: "💛",
        title: "Every life matters",
        desc: "No animal is unadoptable. We work with every pet, no matter their age, breed, or background.",
    },
    {
        icon: "🔍",
        title: "Transparent process",
        desc: "We keep adopters informed at every step — from application to first night home.",
    },
    {
        icon: "🤝",
        title: "Community first",
        desc: "We partner with local shelters and volunteers to build a network of care that extends beyond adoption.",
    },
];

function About() {
    return (
        <div className="about-page">

            {/* Hero */}
            <section className="about-hero">
                <div className="about-hero-text">
                    <span className="about-eyebrow">Our Story</span>
                    <h1>We believe every pet deserves a family 🐾</h1>
                    <p>
                        PawHome was founded in 2019 with a simple belief: that the right
                        match between a human and an animal changes both their lives
                        forever. Today we connect hundreds of pets with loving homes every
                        year, guided by compassion, transparency, and community.
                    </p>
                </div>
                <div className="about-hero-visual">
                    <div className="big-paw">🐾</div>
                </div>
            </section>

            {/* Stats */}
            <section className="about-stats">
                {stats.map((s, i) => (
                    <div key={i} className="stat-item">
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                    </div>
                ))}
            </section>

            {/* Mission */}
            <section className="about-mission">
                <h2>Our Mission</h2>
                <p>
                    To make pet adoption accessible, joyful, and lasting — by connecting
                    animals in need with families who are ready to love them, and
                    supporting both through every stage of the journey.
                </p>
            </section>

            {/* Values */}
            <section className="about-values">
                <h2>What We Stand For</h2>
                <div className="values-grid">
                    {values.map((v, i) => (
                        <div key={i} className="value-card">
                            <span className="value-icon">{v.icon}</span>
                            <h3>{v.title}</h3>
                            <p>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="about-team">
                <h2>Meet the Team</h2>
                <p className="team-sub">The people behind every successful adoption.</p>
                <div className="team-grid">
                    {team.map((member, i) => (
                        <div key={i} className="team-card">
                            <div className="team-avatar">{member.emoji}</div>
                            <h3>{member.name}</h3>
                            <span>{member.role}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta">
                <h2>Want to help?</h2>
                <p>Volunteer, foster, or simply spread the word — every action counts.</p>
                <div className="about-cta-btns">
                    <a href="/pets" className="cta-primary">Find a Pet</a>
                    <a href="/contact" className="cta-secondary">Get in Touch</a>
                </div>
            </section>
        </div>
    );
}

export default About;