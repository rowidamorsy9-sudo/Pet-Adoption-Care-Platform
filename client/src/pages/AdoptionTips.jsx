import React, { useState } from "react";
import "./AdoptionTips.css";

const tips = [
    {
        icon: "🏠",
        title: "Prepare Your Home",
        summary: "Make your space safe and welcoming before your pet arrives.",
        details: [
            "Remove toxic plants, loose cables, and small swallowable objects.",
            "Set up a cozy sleeping area with a bed or blanket in a quiet corner.",
            "Secure trash cans and store cleaning supplies out of reach.",
            "Install baby gates if you want to restrict certain rooms initially.",
        ],
    },
    {
        icon: "🐾",
        title: "Choose the Right Pet",
        summary: "Match a pet's energy and needs to your lifestyle honestly.",
        details: [
            "Consider your daily schedule — high-energy dogs need frequent walks.",
            "Think about allergies, apartment size, and whether you have children.",
            "Older pets are often calmer and already house-trained — a great option for busy families.",
            "Spend time with the animal at the shelter before deciding.",
        ],
    },
    {
        icon: "💊",
        title: "Schedule a Vet Visit",
        summary: "A check-up within the first week sets your pet up for a healthy life.",
        details: [
            "Bring any medical records provided by the shelter.",
            "Establish a vaccination and deworming schedule.",
            "Ask about spaying or neutering if not already done.",
            "Discuss diet, exercise, and any breed-specific health concerns.",
        ],
    },
    {
        icon: "🤝",
        title: "Be Patient During Adjustment",
        summary: "Most pets need 3 days to decompress and 3 weeks to settle in.",
        details: [
            "Give your pet a safe quiet space and don't overwhelm them with visitors.",
            "Let the pet set the pace for affection — don't force interaction.",
            "Stick to a routine for feeding, walks, and bedtime.",
            "Expect some setbacks — accidents and anxiety are normal at first.",
        ],
    },
    {
        icon: "🧠",
        title: "Training & Socialisation",
        summary: "Early, consistent training builds trust and good habits.",
        details: [
            "Use positive reinforcement — reward good behaviour immediately.",
            "Short, daily training sessions (5–10 min) are more effective than long ones.",
            "Socialise puppies and kittens with different people, sounds, and environments.",
            "Consider a local obedience class for dogs — it helps both of you bond.",
        ],
    },
    {
        icon: "❤️",
        title: "Commit for the Long Term",
        summary: "Adoption is a lifetime promise — be ready for the full journey.",
        details: [
            "Average dog lifespan is 10–15 years; cats often live 15–20 years.",
            "Budget for food, vet bills, grooming, and pet insurance.",
            "Plan for holidays and travel — arrange trusted pet-sitters in advance.",
            "If challenges arise, contact a behaviourist before considering rehoming.",
        ],
    },
];

function AdoptionTips() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <div className="tips-page">
            <div className="tips-hero">
                <span className="tips-eyebrow">Adoption Guide</span>
                <h1>Tips for a Happy Start 🐾</h1>
                <p>
                    Bringing a pet home is one of life's greatest joys — and one of its
                    biggest responsibilities. These tips will help you and your new
                    companion thrive from day one.
                </p>
            </div>

            <div className="tips-grid">
                {tips.map((tip, i) => (
                    <div
                        key={i}
                        className={`tip-card ${openIndex === i ? "open" : ""}`}
                        onClick={() => toggle(i)}
                    >
                        <div className="tip-header">
                            <span className="tip-icon">{tip.icon}</span>
                            <div className="tip-text">
                                <h3>{tip.title}</h3>
                                <p>{tip.summary}</p>
                            </div>
                            <span className="tip-arrow">{openIndex === i ? "▲" : "▼"}</span>
                        </div>

                        {openIndex === i && (
                            <ul className="tip-details">
                                {tip.details.map((d, j) => (
                                    <li key={j}>{d}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            <div className="tips-cta">
                <h2>Ready to find your match?</h2>
                <p>Hundreds of loving pets are waiting for a home just like yours.</p>
                <a href="/pets" className="cta-btn">Browse Available Pets →</a>
            </div>
        </div>
    );
}

export default AdoptionTips;