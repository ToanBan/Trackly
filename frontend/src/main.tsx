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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/cart" element={<Cart />} />
            </Routes>
          </CartProvider>
        </TableSessionProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
