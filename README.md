# 🐾 PawHome — Pet Adoption & Care Platform

> A full-stack MERN web application for browsing, adopting, and managing pets — with role-based authentication, an admin dashboard, user profiles with image uploads, a contact system, wishlist, cart, and more.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Live Features](#-live-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Database Models](#-database-models)
6. [API Reference](#-api-reference)
7. [Frontend Pages & Routes](#-frontend-pages--routes)
8. [Authentication & Authorization](#-authentication--authorization)
9. [Environment Variables](#-environment-variables)
10. [Installation & Setup](#-installation--setup)
11. [Deployment (Vercel)](#-deployment-vercel)
12. [Known Limitations](#-known-limitations)
13. [Troubleshooting](#-troubleshooting)

---

## 🧭 Project Overview

PawHome connects people with pets that need a home. Users can browse available animals, save favorites to a wishlist, add pets to a cart, submit adoption applications, and manage their personal profile. Admins get a full dashboard to manage pets, users, applications, and contact messages.

The authentication system supports two roles — **user** and **admin** — with access control enforced on both the backend (JWT middleware) and the frontend (protected routes).

---

## ✨ Live Features

### 👤 Users
- Register and log in securely (JWT-based)
- Browse all available pets with filters
- View detailed pet profiles
- Add pets to a **Wishlist** ❤️ and **Cart** 🛒
- Submit an **Adoption Application** with personal details and reason
- Track the status of submitted applications (`pending` / `approved` / `rejected`)
- View and edit their **Profile** — name, email, phone, address, password
- Upload and change a **Profile Picture**
- Send messages via the **Contact** form

### 🛠️ Admins
- Secure admin panel (no Navbar — full-screen dashboard)
- View platform statistics: total users, pets, applications, pending count
- **Manage Users** — view all users, edit their info, delete accounts
- **Manage Pets** — add, edit, delete pets with full details
- **Manage Applications** — review, approve, or reject adoption applications
- **Manage Contact Messages** — view all messages and send email replies
- Seed the first admin account via a CLI script

---

## 🛠 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | — | Runtime |
| Express.js | ^5.2.1 | HTTP server & routing |
| Mongoose | ^9.6.1 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT auth tokens |
| dotenv | ^17.4.2 | Environment variables |
| cors | ^2.8.6 | Cross-origin requests |
| multer | ^1.x | Profile image uploads |
| nodemon | ^3.1.14 | Dev auto-restart |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^19.2.5 | UI library |
| React DOM | ^19.2.5 | DOM rendering |
| React Router DOM | ^7.14.2 | Client-side routing |
| Vite | ^8.0.10 | Build tool & dev server |

### Database
- **MongoDB Atlas** (cloud) or local MongoDB

---

## 📁 Project Structure

```
advanced web project/
│
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── hero.png
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar (with profile avatar)
│   │   │   ├── Navbar.css
│   │   │   ├── PetCard.jsx          # Pet listing card component
│   │   │   ├── PetCard.css
│   │   │   ├── ApplicationCard.jsx  # Application list card
│   │   │   ├── ApplicationCard.css
│   │   │   ├── DashboardCard.jsx    # Admin stat card
│   │   │   └── ProtectedRoute.jsx   # Route auth guard
│   │   ├── pages/
│   │   │   ├── Pets.jsx             # Pet browsing (home)
│   │   │   ├── Pets.css
│   │   │   ├── PetDetails.jsx       # Single pet view
│   │   │   ├── PetDetails.css
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── Auth.css             # Shared auth styles
│   │   │   ├── Profile.jsx          # User profile (edit + photo upload)
│   │   │   ├── Profile.css
│   │   │   ├── ApplyAdoption.jsx    # Adoption application form
│   │   │   ├── ApplyAdoption.css
│   │   │   ├── MyApplications.jsx   # User's submitted applications
│   │   │   ├── MyApplications.css
│   │   │   ├── Cart.jsx             # Cart page
│   │   │   ├── Cart.css
│   │   │   ├── Wishlist.jsx         # Wishlist page
│   │   │   ├── Wishlist.css
│   │   │   ├── About.jsx            # About page
│   │   │   ├── About.css
│   │   │   ├── Contact.jsx          # Contact form
│   │   │   ├── Contact.css
│   │   │   ├── AdoptionTips.jsx     # Adoption tips article
│   │   │   ├── AdoptionTips.css
│   │   │   ├── AdminDashboard.jsx   # Full admin panel
│   │   │   ├── AdminDashboard.css
│   │   │   ├── AddPet.jsx           # Admin: add new pet
│   │   │   ├── Petform.css
│   │   │   ├── EditPet.jsx          # Admin: edit existing pet
│   │   │   ├── MyPets.jsx           # Admin: manage own pets
│   │   │   ├── Mypets.css
│   │   │   ├── ManageApplications.jsx
│   │   │   └── ManageApplications.css
│   │   ├── App.jsx                  # Router + layout
│   │   ├── App.css
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                          # Node.js / Express backend
    ├── index.js                     # App entry point
    ├── .env                         # Environment variables (not committed)
    ├── models/
    │   ├── User.js                  # User schema
    │   ├── Pet.js                   # Pet schema
    │   ├── Application.js           # Adoption application schema
    │   └── ContactMessage.js        # Contact message schema
    ├── controllers/
    │   ├── authController.js        # register + login
    │   ├── userController.js        # profile CRUD + image upload
    │   ├── petController.js         # public pet browsing
    │   ├── petManageController.js   # admin pet CRUD
    │   ├── applicationController.js # user application submit + view
    │   ├── adminApplicationController.js  # admin application review
    │   ├── adminController.js       # dashboard stats + user management
    │   └── contactController.js     # contact form + admin replies
    ├── routes/
    │   ├── authRoutes.js            # /api/auth/*
    │   ├── userRoutes.js            # /api/users/*
    │   ├── petRoutes.js             # /api/pets/*
    │   ├── petManageRoutes.js       # /api/pet-manage/*
    │   ├── applicationRoutes.js     # /api/applications/*
    │   ├── adminRoutes.js           # /api/admin/*
    │   ├── adminApplicationRoutes.js
    │   ├── contactRoutes.js         # /api/contact/*
    │   └── adminContactRoutes.js    # /api/admin/contact-messages/*
    ├── middleware/
    │   └── authMiddleware.js        # verifyToken + requireAdmin
    ├── scripts/
    │   └── seedAdmin.js             # CLI script to create the first admin
    ├── uploads/
    │   └── profiles/                # Uploaded profile images (auto-created)
    └── package.json
```

---

## 🗄 Database Models

### User
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required, min 2 chars |
| `email` | String | Required, unique, lowercase |
| `password` | String | Required, min 6 chars, bcrypt hashed |
| `role` | String | `"user"` or `"admin"`, default `"user"` |
| `phone` | String | Optional |
| `address` | String | Optional |
| `profileImage` | String | Filename of uploaded photo, default `""` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### Pet
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `type` | String | Required (e.g. Dog, Cat) |
| `age` | Number | Required |
| `breed` | String | Required |
| `gender` | String | Required |
| `healthStatus` | String | Default `"Healthy"` |
| `vaccinated` | Boolean | Default `false` |
| `goodWithKids` | Boolean | Default `true` |
| `goodWithPets` | Boolean | Default `true` |
| `medicalNotes` | String | Optional |
| `description` | String | Optional |
| `location` | String | Required |
| `image` | String | Image URL |
| `donationFee` | Number | Default `100` |
| `deliveryFee` | Number | Default `50` |
| `status` | String | `"available"` or `"adopted"` |
| `provider` | ObjectId | Ref: User (admin who added it) |

### Application
| Field | Type | Notes |
|---|---|---|
| `petId` | ObjectId | Ref: Pet |
| `petName` | String | Default `"Selected Pet"` |
| `userName` | String | Required |
| `userEmail` | String | Required |
| `phone` | String | Required |
| `address` | String | Required |
| `reason` | String | Required |
| `status` | String | `"pending"` / `"approved"` / `"rejected"` |

### ContactMessage
| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `email` | String | Required |
| `subject` | String | Required |
| `message` | String | Required |
| `userId` | ObjectId | Ref: User (optional, if logged in) |
| `status` | String | `"unread"` or `"replied"` |
| `adminReply` | String | Admin's reply text |
| `repliedAt` | Date | Timestamp of reply |

---

## 📡 API Reference

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create a new user account |
| POST | `/api/auth/login` | None | Login and receive a JWT token |

**Register request body:**
```json
{
  "name": "Jana Ahmed",
  "email": "jana@example.com",
  "password": "secret123"
}
```

**Login / Register response:**
```json
{
  "message": "Login successful!",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Jana Ahmed", "email": "jana@example.com", "role": "user" }
}
```

---

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Token | Get logged-in user's profile |
| PUT | `/api/users/profile` | Token | Update name, email, phone, address, password |
| POST | `/api/users/profile/image` | Token | Upload / change profile picture (multipart) |
| GET | `/api/users/all` | Admin | Get all users |
| PUT | `/api/users/:id` | Admin | Admin edits any user |

---

### Pets — `/api/pets`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/pets` | None | Get all available pets |
| GET | `/api/pets/:id` | None | Get a single pet by ID |

---

### Pet Management — `/api/pet-manage` *(Admin only)*
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/pet-manage` | Admin | Get pets added by this admin |
| POST | `/api/pet-manage` | Admin | Add a new pet |
| PUT | `/api/pet-manage/:id` | Admin | Edit an existing pet |
| DELETE | `/api/pet-manage/:id` | Admin | Delete a pet |

---

### Applications — `/api/applications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/applications/submit` | None | Submit an adoption application |
| GET | `/api/applications/my-applications` | None | Get applications by user email |

---

### Admin Applications — `/api/admin/applications` *(Admin only)*
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/applications` | Admin | Get all applications |
| PUT | `/api/admin/applications/:id` | Admin | Approve or reject an application |

---

### Admin — `/api/admin` *(Admin only)*
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | Platform stats (users, pets, apps, pending) |
| GET | `/api/admin/users` | Admin | List all users |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user (cannot delete self) |

---

### Contact — `/api/contact`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | None | Submit a contact message |

### Admin Contact — `/api/admin/contact-messages` *(Admin only)*
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/contact-messages` | Admin | Get all contact messages |
| POST | `/api/admin/contact-messages/:id/reply` | Admin | Send a reply to a message |

---

### Static Files
| Path | Description |
|---|---|
| `GET /uploads/profiles/:filename` | Serve uploaded profile images |

---

## 🖥 Frontend Pages & Routes

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | `Pets.jsx` | Public | Home — browse all pets |
| `/pets` | `Pets.jsx` | Public | Same as home |
| `/pets/:id` | `PetDetails.jsx` | Public | Single pet detail view |
| `/login` | `Login.jsx` | Public | Login form |
| `/register` | `Register.jsx` | Public | Registration form |
| `/profile` | `Profile.jsx` | Public* | User profile + edit + image upload |
| `/wishlist` | `Wishlist.jsx` | Public | Saved pets (localStorage) |
| `/cart` | `Cart.jsx` | Public | Cart (localStorage) |
| `/apply-adoption/:petId` | `ApplyAdoption.jsx` | Public | Adoption application form |
| `/my-applications` | `MyApplications.jsx` | Public | User's submitted applications |
| `/about` | `About.jsx` | Public | About PawHome |
| `/contact` | `Contact.jsx` | Public | Contact form |
| `/adoption-tips` | `AdoptionTips.jsx` | Public | Adoption guide article |
| `/admin` | `AdminDashboard.jsx` | Admin only | Dashboard overview |
| `/admin/applications` | `AdminDashboard.jsx` | Admin only | Manage applications tab |
| `/admin/users` | `AdminDashboard.jsx` | Admin only | Manage users tab |
| `/admin/messages` | `AdminDashboard.jsx` | Admin only | Contact messages tab |
| `/admin/my-pets` | `MyPets.jsx` | Admin only | Admin's pet list |
| `/admin/add-pet` | `AddPet.jsx` | Admin only | Add new pet form |
| `/admin/edit-pet/:id` | `EditPet.jsx` | Admin only | Edit pet form |

> \* Profile redirects to `/login` if no token is found.

---

## 🔐 Authentication & Authorization

### How it works

1. User submits email + password to `POST /api/auth/login`
2. Server verifies password with `bcrypt.compare()`
3. Server signs a JWT containing `{ id, role }` with a 7-day expiry
4. Frontend stores the token in `localStorage`
5. Every protected request sends `Authorization: Bearer <token>`
6. `authMiddleware.js` verifies the token on every protected route
7. `requireAdmin` middleware checks `req.user.role === "admin"` and returns `403` if not

### Frontend route protection

```jsx
// App.jsx — admin routes wrapped in ProtectedRoute
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

`ProtectedRoute` reads the token and role from `localStorage`. If invalid or wrong role, it redirects to `/login`.

### Two roles

| Role | Can do |
|---|---|
| `user` | Browse pets, wishlist, cart, apply, view profile, contact |
| `admin` | Everything above + full admin dashboard (manage pets, users, applications, messages) |

> Admin accounts cannot be registered through the normal form — they must be created via the `seedAdmin.js` script.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` folder:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/petAdoptionDB
PORT=4000
JWT_SECRET=your_super_secret_key_here
```

> ⚠️ **Never commit `.env` to version control.** Make sure `server/.env` is listed in `.gitignore`.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pawhome.git
cd pawhome
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env` with the variables above.

### 3. Seed the first admin user

```bash
node scripts/seedAdmin.js
```

This interactive script prompts for a name, email, and password and creates the admin account in MongoDB. It is idempotent — re-running it updates the existing admin instead of creating a duplicate.

### 4. Set up the frontend

```bash
cd ../client
npm install
```

### 5. Run both servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "ready for deployment"
git push origin main
```

### 2. Deploy the frontend

- Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
- Set **Root Directory** to `client`
- Framework: **Vite** (auto-detected)
- Add environment variable: `VITE_API_URL = https://your-backend.vercel.app`
- Click **Deploy**

### 3. Deploy the backend

Add a `vercel.json` file inside `server/`:

```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }]
}
```

- Go to Vercel → **Add New Project** → same repo
- Set **Root Directory** to `server`
- Framework: **Other**
- Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`
- Click **Deploy**

### 4. Connect frontend to backend

Replace every `http://localhost:4000` in your React code with:

```js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
```

### 5. Update CORS

```js
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
  credentials: true,
}));
```

> ⚠️ **Note on image uploads:** Vercel's filesystem is read-only between deployments. For persistent profile images in production, migrate `multer` storage to [Cloudinary](https://cloudinary.com) or [AWS S3](https://aws.amazon.com/s3/).

---

## ⚠️ Known Limitations

- **Profile images** are stored on the local filesystem (`server/uploads/profiles/`). On Vercel they do not persist across deployments — Cloudinary or S3 integration is needed for production.
- **Cart and Wishlist** are stored in `localStorage` only and are not synced to the database.
- The `color-scheme: light dark` in `index.css` can cause modal inputs to appear black in dark mode on some browsers. Fixed by adding `background: #fff; color-scheme: light;` to `.modal-field input` in `AdminDashboard.css`.

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Cannot connect to MongoDB` | Wrong `MONGODB_URI` | Check `.env` and MongoDB Atlas network access (allow `0.0.0.0/0`) |
| `jwt malformed` or `401` | Expired or missing token | Log out and log back in |
| Admin panel shows 403 | Logged in as regular user | Use an admin account or run `seedAdmin.js` |
| `Cannot find module 'multer'` | Multer not installed | `cd server && npm install multer` |
| Modal inputs appear black | Dark mode + missing `background` on inputs | Add `background: #fff; color-scheme: light;` to `.modal-field input` in `AdminDashboard.css` |
| Profile image broken link | Static route missing | Ensure `app.use("/uploads", express.static(...))` is in `server/index.js` |
| Port already in use | Another process on port 4000 | Kill it: `lsof -ti:4000 \| xargs kill` |
| Frontend not updating after login | `storageUpdated` event not firing | Make sure `window.dispatchEvent(new Event("storageUpdated"))` is called after every localStorage write |

---

## 📄 License

This project is for educational purposes.

---

*Built with ❤️ and 🐾 — PawHome*