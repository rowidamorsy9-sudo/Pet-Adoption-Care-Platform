/**
 * seedAdmin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time script to create an admin user in MongoDB.
 * Run with:  node scripts/seedAdmin.js
 *
 * Environment variables are read from server/.env (via dotenv).
 * The script is idempotent — re-running it updates the existing admin's
 * password instead of creating a duplicate.
 *
 * Usage examples:
 *   node scripts/seedAdmin.js
 *   ADMIN_EMAIL=boss@pawHome.com ADMIN_PASSWORD=secret123 node scripts/seedAdmin.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const readline = require("readline");

// ── Load User model ───────────────────────────────────────────────────────────
const User = require("../models/User");

// ── Config (fall back to env vars or prompt) ──────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
    console.error("❌  MONGODB_URI is not set in .env");
    process.exit(1);
}

// ── Prompting helpers ─────────────────────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((res) => rl.question(question, res));

async function prompt() {
    console.log("\n🐾  PawHome — Admin Seeder\n");

    const name     = (await ask("Admin name     : ")).trim() || "Admin";
    const email    = (await ask("Admin email    : ")).trim();
    const password = (await ask("Admin password : ")).trim();

    if (!email || !password) {
        console.error("❌  Email and password are required.");
        rl.close();
        process.exit(1);
    }
    if (password.length < 6) {
        console.error("❌  Password must be at least 6 characters.");
        rl.close();
        process.exit(1);
    }

    rl.close();
    return { name, email, password };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    const { name, email, password } = await prompt();

    await mongoose.connect(MONGO_URI);
    console.log("\n✅  Connected to MongoDB");

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
        if (existing.role !== "admin") {
            existing.role = "admin";
        }
        existing.name     = name;
        existing.password = password; // pre-save hook hashes it
        await existing.save();
        console.log(`✅  Existing user promoted/updated → admin: ${email}`);
    } else {
        await User.create({ name, email, password, role: "admin" });
        console.log(`✅  New admin created: ${email}`);
    }

    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB\n");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌  Seed failed:", err.message);
    process.exit(1);
});