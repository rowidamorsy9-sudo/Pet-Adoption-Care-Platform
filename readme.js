const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, ExternalHyperlink
} = require("docx");
const fs = require("fs");

// ── Helpers ───────────────────────────────────────────────────────────────────
const border  = { style: BorderStyle.SINGLE, size: 1, color: "D0D7DE" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const cell = (text, isHeader = false, width = 3120, shade = null) =>
    new TableCell({
        borders,
        width: { size: width, type: WidthType.DXA },
        shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({
            children: [new TextRun({ text, bold: isHeader, font: "Consolas", size: isHeader ? 18 : 18 })]
        })]
    });

const h1 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, font: "Arial", color: "0F172A" })]
});

const h2 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: "1D4ED8" })]
});

const h3 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: "374151" })]
});

const p = (runs, spacing = { before: 60, after: 100 }) =>
    new Paragraph({ spacing, children: Array.isArray(runs) ? runs : [new TextRun({ text: runs, size: 22, font: "Arial" })] });

const bullet = (text, ref = "bullets") =>
    new Paragraph({
        numbering: { reference: ref, level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, size: 22, font: "Arial" })]
    });

const bulletMixed = (parts) =>
    new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { before: 40, after: 40 },
        children: parts
    });

const code = (text) =>
    new Paragraph({
        spacing: { before: 60, after: 60 },
        shading: { fill: "F6F8FA", type: ShadingType.CLEAR },
        indent: { left: 360 },
        children: [new TextRun({ text, font: "Consolas", size: 20, color: "C0392B" })]
    });

const codeBlock = (lines) => {
    const paragraphs = [];
    paragraphs.push(new Paragraph({
        spacing: { before: 100, after: 0 },
        shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
        indent: { left: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "333355" } },
        children: []
    }));
    lines.forEach(line => {
        paragraphs.push(new Paragraph({
            spacing: { before: 0, after: 0 },
            shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
            indent: { left: 360, right: 360 },
            children: [new TextRun({ text: line || " ", font: "Consolas", size: 20, color: "A9DC76" })]
        }));
    });
    paragraphs.push(new Paragraph({
        spacing: { before: 0, after: 100 },
        shading: { fill: "1E1E2E", type: ShadingType.CLEAR },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "333355" } },
        children: []
    }));
    return paragraphs;
};

const divider = () => new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" } },
    children: []
});

const badge = (label, bg, fg = "FFFFFF") =>
    new TextRun({ text: ` ${label} `, bold: true, size: 18, font: "Arial", color: fg,
        shading: { type: ShadingType.CLEAR, fill: bg } });

const run = (text, opts = {}) => new TextRun({ text, size: 22, font: "Arial", ...opts });
const mono = (text) => new TextRun({ text, font: "Consolas", size: 20, color: "7C3AED" });

// ── Two-column table helper ────────────────────────────────────────────────────
const twoColTable = (rows, col1W = 3600, col2W = 5760) =>
    new Table({
        width: { size: col1W + col2W, type: WidthType.DXA },
        columnWidths: [col1W, col2W],
        rows: rows.map(([a, b]) => new TableRow({ children: [cell(a, false, col1W), cell(b, false, col2W)] }))
    });

const headerTable = (cols, colWidths) =>
    new Table({
        width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [
            new TableRow({ children: cols.map((c, i) => cell(c, true, colWidths[i], "EFF6FF")) }),
        ]
    });

const dataTable = (headers, rows, colWidths) =>
    new Table({
        width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        columnWidths: colWidths,
        rows: [
            new TableRow({ children: headers.map((h, i) => cell(h, true, colWidths[i], "EFF6FF")) }),
            ...rows.map(row => new TableRow({ children: row.map((r, i) => cell(r, false, colWidths[i])) }))
        ]
    });

// ── Document ───────────────────────────────────────────────────────────────────
const doc = new Document({
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
        ]
    },
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 36, bold: true, font: "Arial", color: "0F172A" },
              paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 26, bold: true, font: "Arial", color: "1D4ED8" },
              paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 22, bold: true, font: "Arial", color: "374151" },
              paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 } },
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
            }
        },
        children: [

            // ══ COVER ════════════════════════════════════════════════════════
            new Paragraph({
                spacing: { before: 480, after: 80 },
                children: [new TextRun({ text: "🐾 PawHome", font: "Arial", size: 64, bold: true, color: "FF5722" })]
            }),
            new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [new TextRun({ text: "Pet Adoption & Care Platform", font: "Arial", size: 32, color: "374151" })]
            }),
            new Paragraph({
                spacing: { before: 0, after: 400 },
                children: [new TextRun({ text: "Full-Stack MERN Application — Developer Documentation", font: "Arial", size: 22, color: "6B7280", italics: true })]
            }),

            // tech stack badges row
            new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                    badge("MongoDB", "47A248"), run("  "),
                    badge("Express.js", "000000"), run("  "),
                    badge("React 19", "61DAFB", "0F172A"), run("  "),
                    badge("Node.js", "339933"), run("  "),
                    badge("JWT", "7C3AED"), run("  "),
                    badge("bcryptjs", "E74C3C"),
                ]
            }),
            new Paragraph({ spacing: { before: 0, after: 40 }, children: [run(" ")] }),
            divider(),

            // ══ OVERVIEW ═════════════════════════════════════════════════════
            h1("📋 Project Overview"),
            p("PawHome is a full-stack web application built with the MERN stack that allows users to browse pets available for adoption, submit adoption applications, manage wishlists and carts, and for admins to manage the platform through a secure dashboard."),
            new Paragraph({ spacing: { before: 60, after: 120 }, children: [
                run("The authentication system supports two roles — "),
                run("user", { bold: true }),
                run(" and "),
                run("admin", { bold: true }),
                run(" — with role-based access control enforced on both backend routes (JWT middleware) and frontend routes (ProtectedRoute component).")
            ]}),

            // ══ TECH STACK ═══════════════════════════════════════════════════
            divider(),
            h1("🛠 Tech Stack"),

            h2("Backend"),
            dataTable(
                ["Package", "Version", "Purpose"],
                [
                    ["express",      "^5.2.1",  "HTTP server & routing"],
                    ["mongoose",     "^9.6.1",  "MongoDB ODM"],
                    ["bcryptjs",     "^2.4.3",  "Password hashing"],
                    ["jsonwebtoken", "^9.0.2",  "JWT auth tokens"],
                    ["dotenv",       "^17.4.2", "Environment variables"],
                    ["cors",         "^2.8.6",  "Cross-origin requests"],
                    ["nodemon",      "^3.1.14", "Dev auto-restart"],
                ],
                [3000, 2160, 4200]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),

            h2("Frontend"),
            dataTable(
                ["Package", "Version", "Purpose"],
                [
                    ["react",            "^19.2.5",  "UI library"],
                    ["react-dom",        "^19.2.5",  "DOM rendering"],
                    ["react-router-dom", "^7.14.2",  "Client-side routing"],
                    ["vite",             "^8.0.10",  "Build tool & dev server"],
                ],
                [3000, 2160, 4200]
            ),

            // ══ FOLDER STRUCTURE ═════════════════════════════════════════════
            divider(),
            h1("📁 Folder Structure"),
            ...codeBlock([
                "pet-adoption-and-care-platform/",
                "├── client/                    # React frontend (Vite)",
                "│   └── src/",
                "│       ├── components/",
                "│       │   ├── Navbar.jsx          # Top navigation bar",
                "│       │   ├── Navbar.css",
                "│       │   ├── PetCard.jsx         # Pet listing card",
                "│       │   └── ProtectedRoute.jsx  # Route auth guard",
                "│       └── pages/",
                "│           ├── Pets.jsx            # Pet browsing page",
                "│           ├── PetDetails.jsx      # Single pet view",
                "│           ├── Login.jsx           # Login (role redirect)",
                "│           ├── Register.jsx        # Registration form",
                "│           ├── Auth.css            # Shared auth styles",
                "│           ├── AdminDashboard.jsx  # Admin panel",
                "│           ├── AdminDashboard.css",
                "│           ├── ApplyAdoption.jsx   # Adoption form",
                "│           ├── MyApplications.jsx  # User's applications",
                "│           ├── Cart.jsx",
                "│           └── Wishlist.jsx",
                "│",
                "└── server/                    # Node/Express backend",
                "    ├── index.js               # App entry point",
                "    ├── .env                   # Environment variables",
                "    ├── models/",
                "    │   ├── User.js            # User schema (with role)",
                "    │   ├── Pet.js             # Pet schema",
                "    │   └── Application.js     # Adoption application schema",
                "    ├── controllers/",
                "    │   ├── authController.js  # register + login",
                "    │   ├── adminController.js # dashboard, users, delete",
                "    │   ├── petController.js",
                "    │   └── applicationController.js",
                "    ├── routes/",
                "    │   ├── authRoutes.js      # /api/auth/*",
                "    │   ├── adminRoutes.js     # /api/admin/* (protected)",
                "    │   ├── petRoutes.js",
                "    │   └── applicationRoutes.js",
                "    ├── middleware/",
                "    │   └── authMiddleware.js  # verifyToken + requireAdmin",
                "    └── scripts/",
                "        └── seedAdmin.js       # CLI admin seeder",
            ]),

            // ══ ENVIRONMENT VARIABLES ════════════════════════════════════════
            divider(),
            h1("⚙️ Environment Variables"),
            p("Create a file at server/.env with the following:"),
            ...codeBlock([
                "# MongoDB connection string (from MongoDB Atlas or local)",
                "MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/petAdoptionDB",
                "",
                "# Port the Express server listens on",
                "PORT=4000",
                "",
                "# Secret key used to sign/verify JWT tokens",
                "# Use a long, random string in production",
                "JWT_SECRET=your_super_secret_key_here",
            ]),
            p([run("⚠️  ", { bold: true, color: "D97706" }), run("Never commit ", { color: "D97706" }), mono(".env"), run(" to version control. Add it to ", { color: "D97706" }), mono(".gitignore"), run(".", { color: "D97706" })]),

            // ══ INSTALLATION ═════════════════════════════════════════════════
            divider(),
            h1("🚀 Installation & Running"),

            h2("1. Clone the repository"),
            ...codeBlock([
                "git clone https://github.com/your-username/pet-adoption-platform.git",
                "cd pet-adoption-platform",
            ]),

            h2("2. Install backend dependencies"),
            ...codeBlock([
                "cd server",
                "npm install",
            ]),

            h2("3. Install frontend dependencies"),
            ...codeBlock([
                "cd client",
                "npm install",
            ]),

            h2("4. Seed the first admin user"),
            p("Run this interactive script once to create an admin account in MongoDB:"),
            ...codeBlock([
                "cd server",
                "node scripts/seedAdmin.js",
                "",
                "# You will be prompted:",
                "# Admin name     : Jana",
                "# Admin email    : jana@pawhome.com",
                "# Admin password : ••••••••",
                "",
                "# Output:",
                "# ✅  Connected to MongoDB",
                "# ✅  New admin created: jana@pawhome.com",
            ]),
            p([run("No credentials are hardcoded. The script is "), run("idempotent", { bold: true }), run(" — re-running it updates the existing admin instead of creating a duplicate.")]),

            h2("5. Start the servers"),
            p("Open two separate terminals:"),
            h3("Terminal 1 — Backend"),
            ...codeBlock(["cd server", "npm run dev", "# → Server running on port 4000", "# → MongoDB connected"]),
            h3("Terminal 2 — Frontend"),
            ...codeBlock(["cd client", "npm run dev", "# → Local: http://localhost:5173"]),

            // ══ API REFERENCE ════════════════════════════════════════════════
            divider(),
            h1("📡 API Reference"),

            h2("Auth Routes  —  /api/auth"),
            dataTable(
                ["Method", "Endpoint", "Auth", "Description"],
                [
                    ["POST", "/api/auth/register", "None", "Create a new user account (role: user)"],
                    ["POST", "/api/auth/login",    "None", "Login and receive a JWT token + role"],
                ],
                [1200, 2800, 1200, 4160]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h3("POST /api/auth/register — Request body"),
            ...codeBlock([
                '{',
                '  "name":     "Jana Ahmed",',
                '  "email":    "jana@example.com",',
                '  "password": "secret123"',
                '}',
            ]),
            h3("POST /api/auth/register — Response (201)"),
            ...codeBlock([
                '{',
                '  "message": "Registration successful!",',
                '  "token":   "<JWT>",',
                '  "user": { "id": "...", "name": "Jana Ahmed", "email": "jana@example.com", "role": "user" }',
                '}',
            ]),
            h3("POST /api/auth/login — Response (200)"),
            ...codeBlock([
                '{',
                '  "message": "Login successful!",',
                '  "token":   "<JWT>",',
                '  "user": { "id": "...", "name": "Jana Ahmed", "email": "jana@example.com", "role": "user" }',
                '}',
            ]),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Admin Routes  —  /api/admin  (JWT + Admin role required)"),
            p([run("All routes require the header: "), mono('Authorization: Bearer <token>')]),
            dataTable(
                ["Method", "Endpoint", "Description"],
                [
                    ["GET",    "/api/admin/dashboard",   "Returns total users, pets, applications, pending count"],
                    ["GET",    "/api/admin/users",        "Returns list of all users (passwords excluded)"],
                    ["DELETE", "/api/admin/users/:id",    "Deletes a user (cannot delete own account)"],
                ],
                [1200, 3200, 4960]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Pet Routes  —  /api/pets"),
            dataTable(
                ["Method", "Endpoint", "Description"],
                [
                    ["GET", "/api/pets",     "Get all pets"],
                    ["GET", "/api/pets/:id", "Get a single pet by ID"],
                ],
                [1200, 2800, 5360]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Application Routes  —  /api/applications"),
            dataTable(
                ["Method", "Endpoint", "Description"],
                [
                    ["GET",  "/api/applications",         "Get all applications"],
                    ["POST", "/api/applications",         "Submit a new adoption application"],
                    ["GET",  "/api/applications/:email",  "Get applications by user email"],
                ],
                [1200, 2800, 5360]
            ),

            // ══ DATABASE MODELS ═══════════════════════════════════════════════
            divider(),
            h1("🗄 Database Models"),

            h2("User"),
            dataTable(
                ["Field", "Type", "Rules"],
                [
                    ["name",       "String",  "Required, min 2 characters"],
                    ["email",      "String",  "Required, unique, lowercase, valid format"],
                    ["password",   "String",  "Required, min 6 chars, hashed with bcrypt (12 rounds)"],
                    ["role",       "String",  "Enum: 'user' | 'admin', default: 'user'"],
                    ["createdAt",  "Date",    "Auto-generated (timestamps: true)"],
                    ["updatedAt",  "Date",    "Auto-generated (timestamps: true)"],
                ],
                [1800, 1500, 6060]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Pet"),
            dataTable(
                ["Field", "Type", "Notes"],
                [
                    ["name",         "String",  "Required"],
                    ["type",         "String",  "Required (e.g. Dog, Cat)"],
                    ["age",          "Number",  "Required"],
                    ["breed",        "String",  "Required"],
                    ["gender",       "String",  "Required"],
                    ["healthStatus", "String",  "Default: 'Healthy'"],
                    ["vaccinated",   "Boolean", "Default: false"],
                    ["goodWithKids", "Boolean", "Default: true"],
                    ["goodWithPets", "Boolean", "Default: true"],
                    ["location",     "String",  "Required"],
                    ["image",        "String",  "URL string"],
                    ["donationFee",  "Number",  "Default: 100"],
                    ["deliveryFee",  "Number",  "Default: 50"],
                    ["status",       "String",  "Enum: 'available' | 'adopted', default: 'available'"],
                ],
                [2000, 1500, 5860]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Application"),
            dataTable(
                ["Field", "Type", "Notes"],
                [
                    ["petId",     "ObjectId", "Ref: Pet"],
                    ["petName",   "String",   "Default: 'Selected Pet'"],
                    ["userName",  "String",   "Required"],
                    ["userEmail", "String",   "Required"],
                    ["phone",     "String",   "Required"],
                    ["address",   "String",   "Required"],
                    ["reason",    "String",   "Required — why they want to adopt"],
                    ["status",    "String",   "Enum: 'pending' | 'approved' | 'rejected', default: 'pending'"],
                ],
                [2000, 1500, 5860]
            ),

            // ══ AUTH SYSTEM ═══════════════════════════════════════════════════
            divider(),
            h1("🔐 Authentication & Authorization"),

            h2("How it works"),
            p("The system uses stateless JWT authentication. No sessions are stored on the server."),

            dataTable(
                ["Step", "What happens"],
                [
                    ["1. Login",         "User submits email + password to POST /api/auth/login"],
                    ["2. Verify",        "Server checks password with bcrypt.compare()"],
                    ["3. Issue Token",   "Server signs JWT containing { id, role } with JWT_SECRET, expires in 7 days"],
                    ["4. Store",         "Frontend stores token and user object in localStorage"],
                    ["5. Requests",      "All protected requests send Authorization: Bearer <token> header"],
                    ["6. Middleware",    "verifyToken decodes token, re-fetches user from DB, attaches to req.user"],
                    ["7. Role Check",    "requireAdmin checks req.user.role === 'admin', returns 403 if not"],
                ],
                [2000, 7360]
            ),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Middleware chain"),
            ...codeBlock([
                "// Any request to /api/admin/*",
                "router.use(verifyToken, requireAdmin);",
                "",
                "// verifyToken:",
                "//   1. Read Authorization header",
                "//   2. jwt.verify(token, JWT_SECRET)",
                "//   3. User.findById(decoded.id).select('-password')",
                "//   4. Attach to req.user → next()",
                "",
                "// requireAdmin:",
                "//   if (req.user.role !== 'admin') → 403 Forbidden",
                "//   else → next()",
            ]),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Frontend route protection"),
            ...codeBlock([
                "// ProtectedRoute.jsx",
                "// Usage in App.jsx:",
                '<Route path="/admin" element={',
                "  <ProtectedRoute requiredRole=\"admin\">",
                "    <AdminDashboard />",
                "  </ProtectedRoute>",
                "} />",
                "",
                "// If not logged in         → redirect to /login",
                "// If logged in, wrong role  → admin goes to /admin, user goes to /pets",
            ]),

            new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
            h2("Role-based redirect after login"),
            ...codeBlock([
                "// Login.jsx — after successful API response:",
                "if (data.user.role === 'admin') {",
                "  navigate('/admin');",
                "} else {",
                "  navigate('/pets');",
                "}",
            ]),

            // ══ ADMIN SYSTEM ════════════════════════════════════════════════
            divider(),
            h1("👑 Admin System"),

            h2("Creating an admin account"),
            p([run("Admin accounts are "), run("never created through the registration form", { bold: true, color: "DC2626" }), run(". The register endpoint always sets role to "), mono('"user"'), run(". To create an admin:")]),
            ...codeBlock([
                "cd server",
                "node scripts/seedAdmin.js",
                "",
                "# Or to promote an existing user:",
                "# Run the script with the same email — it will update role to 'admin'",
            ]),

            h2("Admin Dashboard features"),
            bullet("Stat cards: total users, pets, applications, pending applications"),
            bullet("Users table with name, email, role, join date"),
            bullet("Delete user (protected accounts cannot be deleted)"),
            bullet("Sidebar navigation (responsive — hidden on mobile)"),
            bullet("Session-aware: auto-logout if token is invalid or expired"),
            bullet("Refresh button to reload all data"),

            // ══ PAGES ═══════════════════════════════════════════════════════
            divider(),
            h1("📄 Frontend Pages"),
            dataTable(
                ["Route", "Component", "Access", "Description"],
                [
                    ["/",                  "Pets.jsx",            "Public",      "Browse all available pets"],
                    ["/pets/:id",          "PetDetails.jsx",      "Public",      "View single pet details"],
                    ["/register",          "Register.jsx",        "Public",      "Create a user account"],
                    ["/login",             "Login.jsx",           "Public",      "Login, role-based redirect"],
                    ["/cart",              "Cart.jsx",            "Public",      "Pet cart"],
                    ["/wishlist",          "Wishlist.jsx",        "Public",      "Saved pets"],
                    ["/apply-adoption/:id","ApplyAdoption.jsx",   "Public",      "Submit adoption form"],
                    ["/my-applications",   "MyApplications.jsx",  "Public",      "View own applications"],
                    ["/admin",             "AdminDashboard.jsx",  "Admin only",  "Admin dashboard panel"],
                ],
                [2200, 2400, 1600, 3160]
            ),

            // ══ SECURITY ════════════════════════════════════════════════════
            divider(),
            h1("🛡 Security Notes"),
            bullet("Passwords are hashed using bcrypt with 12 salt rounds before storage"),
            bullet("JWT tokens expire after 7 days"),
            bullet("The role field is never accepted from the request body during registration"),
            bullet("verifyToken re-fetches the user from the database on every protected request — a role change takes effect immediately"),
            bullet("Admin self-deletion is blocked server-side"),
            bullet("All admin API routes require both a valid JWT and admin role — they cannot be accessed by regular users even with a valid token"),

            // ══ COMMON ISSUES ════════════════════════════════════════════════
            divider(),
            h1("🔧 Troubleshooting"),
            dataTable(
                ["Error", "Cause", "Fix"],
                [
                    ["next is not a function",  "Mongoose 7+ async hooks",        "Remove next param from pre('save') hook"],
                    ["MongoDB not connecting",  "Wrong MONGODB_URI in .env",       "Check Atlas credentials and IP whitelist"],
                    ["401 Unauthorized",        "Token missing or expired",         "Log in again to get a fresh token"],
                    ["403 Forbidden",           "User role is not admin",           "Use an admin account or seed one with seedAdmin.js"],
                    ["CORS error",             "Backend not running or wrong port", "Ensure server is on port 4000"],
                    ["bcryptjs not found",     "Dependencies not installed",        "Run npm install inside /server"],
                ],
                [2800, 2600, 3960]
            ),

            // ══ QUICK START SUMMARY ════════════════════════════════════════
            divider(),
            h1("⚡ Quick Start Summary"),
            ...codeBlock([
                "# 1. Backend",
                "cd server && npm install && npm run dev",
                "",
                "# 2. Frontend (new terminal)",
                "cd client && npm install && npm run dev",
                "",
                "# 3. Seed admin (one time)",
                "cd server && node scripts/seedAdmin.js",
                "",
                "# 4. Open browser",
                "# Regular user → http://localhost:5173/register",
                "# Admin login  → http://localhost:5173/login  (→ /admin)",
            ]),

            new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "🐾  Built with love for pets and clean code  🐾", size: 20, font: "Arial", color: "9CA3AF", italics: true })]
            }),

        ]
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync("PawHome_README.docx", buf);
    console.log("Done");
});