import { BrowserRouter, Routes, Route } from "react-router-dom";

// PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePenghuni from "./pages/HomePenghuni";
import Pengumuman from "./pages/Pengumuman";
import LayananPenghuni from "./pages/LayananPenghuni";
import DetailTagihan from "./pages/DetailTagihan";
import Riwayat from "./pages/riwayat";
import Homeadmin from "./pages/HomeAdmin";
import PengingatTempo from "./pages/PengingatTempo";
import CleaningService from "./pages/CleaningService";
import Deposit from "./pages/Deposit";
import ForumKomunikasi from "./pages/ForumKomunikasi";
import FormPembayaran from "./pages/FormPembayaran";
import NotFound from "./pages/NotFound";

// GUARD
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD PENGHUNI — butuh login sebagai penghuni */}
        <Route path="/dashboard-penghuni" element={
          <ProtectedRoute requiredRole="penghuni"><HomePenghuni /></ProtectedRoute>
        } />
        <Route path="/pengumuman" element={
          <ProtectedRoute requiredRole="penghuni"><Pengumuman /></ProtectedRoute>
        } />
        <Route path="/layanan-penghuni" element={
          <ProtectedRoute requiredRole="penghuni"><LayananPenghuni /></ProtectedRoute>
        } />
        <Route path="/jatuhtempo" element={
          <ProtectedRoute requiredRole="penghuni"><PengingatTempo /></ProtectedRoute>
        } />
        <Route path="/detail-tagihan" element={
          <ProtectedRoute requiredRole="penghuni"><DetailTagihan /></ProtectedRoute>
        } />
        <Route path="/riwayat" element={
          <ProtectedRoute requiredRole="penghuni"><Riwayat /></ProtectedRoute>
        } />
        <Route path="/cleaningservice" element={
          <ProtectedRoute requiredRole="penghuni"><CleaningService /></ProtectedRoute>
        } />
        <Route path="/depositdenda" element={
          <ProtectedRoute requiredRole="penghuni"><Deposit /></ProtectedRoute>
        } />
        <Route path="/forumkomunikasi" element={
          <ProtectedRoute requiredRole="penghuni"><ForumKomunikasi /></ProtectedRoute>
        } />
        <Route path="/form-pembayaran" element={
          <ProtectedRoute requiredRole="penghuni"><FormPembayaran /></ProtectedRoute>
        } />

        {/* DASHBOARD ADMIN — butuh login sebagai owner */}
        <Route path="/homeadmin" element={
          <ProtectedRoute requiredRole="owner"><Homeadmin /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
