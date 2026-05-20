import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Pets from "./pages/Pets";
import PetDetails from "./pages/PetDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplyAdoption from "./pages/ApplyAdoption";
import MyApplications from "./pages/MyApplications";
import AdminDashboard from "./pages/AdminDashboard";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import MyPets from "./pages/MyPets";
import AdoptionTips from "./pages/AdoptionTips";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin panel — no Navbar, admin-only ── */}
        <Route path="/admin"              element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"        element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/messages"     element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* ── All other pages share the Navbar ── */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/"                        element={<Pets />} />
                <Route path="/pets"                    element={<Pets />} />
                <Route path="/pets/:id"                element={<PetDetails />} />
                <Route path="/cart"                    element={<Cart />} />
                <Route path="/wishlist"                element={<Wishlist />} />
                <Route path="/login"                   element={<Login />} />
                <Route path="/register"                element={<Register />} />
                <Route path="/about"                   element={<About />} />
                <Route path="/contact"                 element={<Contact />} />
                <Route path="/adoption-tips"           element={<AdoptionTips />} />
                <Route path="/apply-adoption/:petId"   element={<ApplyAdoption />} />
                <Route path="/my-applications"         element={<MyApplications />} />
                <Route path="/profile"                 element={<Profile />} />

                {/* ── Admin pet-management pages (with Navbar) ── */}
                <Route path="/admin/my-pets"      element={<ProtectedRoute requiredRole="admin"><MyPets /></ProtectedRoute>} />
                <Route path="/admin/add-pet"      element={<ProtectedRoute requiredRole="admin"><AddPet /></ProtectedRoute>} />
                <Route path="/admin/edit-pet/:id" element={<ProtectedRoute requiredRole="admin"><EditPet /></ProtectedRoute>} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
