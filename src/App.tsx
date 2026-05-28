import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

        {/* DASHBOARD PENGHUNI */}
        <Route path="/dashboard-penghuni" element={<HomePenghuni />} />

        {/* PENGUMUMAN */}
        <Route path="/pengumuman" element={<Pengumuman />} />

        {/* LAYANAN PENGHUNI */}
        <Route path="/layanan-penghuni" element={<LayananPenghuni />} />

        {/* PENGINGAT JATUH TEMPO */}
        <Route path="/jatuhtempo" element={<PengingatTempo />} />

        {/* DETAIL TAGIHAN */}
        <Route path="/detail-tagihan" element={<DetailTagihan />} />

        {/* RIWAYAT */}
        <Route path="/riwayat" element={<Riwayat />} />

        {/* HOME ADMIN */}
        <Route path="/homeadmin" element={<Homeadmin />} />

        {/* CLEANING SERVICE */}
        <Route path="/cleaningservice" element={<CleaningService />} />

        <Route path="/depositdenda" element={<Deposit />} />

        <Route path="/forumkomunikasi" element={<ForumKomunikasi />} />

        <Route path="/form-pembayaran" element={<FormPembayaran />} />

        {/* ROUTE TIDAK DITEMUKAN */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
