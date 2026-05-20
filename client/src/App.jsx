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

// Layout wrapper that includes the Navbar
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin panel — no Navbar, admin-only ── */}
        <Route path="/admin"              element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"        element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/messages"     element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* ── Admin pet-management pages (with Navbar) ── */}
        <Route path="/admin/my-pets"      element={<ProtectedRoute requiredRole="admin"><MainLayout><MyPets /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/add-pet"      element={<ProtectedRoute requiredRole="admin"><MainLayout><AddPet /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/edit-pet/:id" element={<ProtectedRoute requiredRole="admin"><MainLayout><EditPet /></MainLayout></ProtectedRoute>} />

        {/* ── All other pages with Navbar ── */}
        <Route path="/"                      element={<MainLayout><Pets /></MainLayout>} />
        <Route path="/pets"                  element={<MainLayout><Pets /></MainLayout>} />
        <Route path="/pets/:id"              element={<MainLayout><PetDetails /></MainLayout>} />
        <Route path="/cart"                  element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/wishlist"              element={<MainLayout><Wishlist /></MainLayout>} />
        <Route path="/login"                 element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register"              element={<MainLayout><Register /></MainLayout>} />
        <Route path="/about"                 element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact"              element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/adoption-tips"         element={<MainLayout><AdoptionTips /></MainLayout>} />
        <Route path="/apply-adoption/:petId" element={<MainLayout><ApplyAdoption /></MainLayout>} />
        <Route path="/my-applications"       element={<MainLayout><MyApplications /></MainLayout>} />
        <Route path="/profile"               element={<MainLayout><Profile /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;