import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { TableSessionProvider } from "./context/TableSessionContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Result from "./pages/Result.tsx";
import Discover from "./pages/Discover.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Profile from "./pages/Profile.tsx";
import Kitchen from "./pages/Kitchen.tsx";
import Home from "./pages/Home.tsx";
import DishDetail from "./pages/DishDetail.tsx";
import Cart from "./pages/Cart.tsx";
import RoleGuard from "./components/guards/RoleGuard.tsx";
import type { User } from "./api/auth.ts";

const isAdmin = (user: User) => (user.roles ?? []).includes("admin");
const isStaffOrAdmin = (user: User) =>
  (user.roles ?? []).some((r) => r === "staff" || r === "admin");
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <TableSessionProvider>
          <CartProvider>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dish/:id" element={<DishDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/result" element={<Result />} />
            <Route path="/discover" element={<Discover />} />
            <Route
              path="/dashboard"
              element={
                <RoleGuard allow={isAdmin}>
                  <Dashboard />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/kitchen"
              element={
                <RoleGuard allow={isStaffOrAdmin}>
                  <Kitchen />
                </RoleGuard>
              }
            />
            <Route path="/cart" element={<Cart />} />
            </Routes>
          </CartProvider>
        </TableSessionProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
