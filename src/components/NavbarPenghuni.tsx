/**
 * NavbarPenghuni - Navbar untuk halaman penghuni
 * Dilengkapi badge notifikasi real-time
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifikasi } from "../hooks/useNotifikasi";
import heroImg from "../assets/logo-navbar.png";

interface NavbarPenghuniProps {
  onLogout: () => void;
}

export default function NavbarPenghuni({ onLogout }: NavbarPenghuniProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifikasis, unreadCount, markRead, markAllRead } = useNotifikasi();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link to="/dashboard-penghuni" className="flex items-center gap-3">
          <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide">HOMIA</h1>
        </Link>

        <div className="flex gap-6 text-white text-base items-center">
          <Link to="/dashboard-penghuni" className="hover:underline transition font-semibold">Dashboard</Link>
          <Link to="/layanan-penghuni" className="hover:underline transition font-semibold">Layanan</Link>

          {/* NOTIFIKASI BELL */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-all duration-200"
              aria-label="Notifikasi"
            >
              {/* Bell icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>

              {/* Badge count */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN NOTIFIKASI */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-gray-900">Notifikasi</p>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} baru</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-500 font-bold hover:underline transition">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                {/* List notifikasi */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {(notifikasis as any[]).length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                      <p>Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    (notifikasis as any[]).map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left px-5 py-3.5 hover:bg-blue-50/50 transition-colors flex items-start gap-3 ${n.status_baca === "Belum Dibaca" ? "bg-blue-50/30" : ""}`}
                      >
                        <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.status_baca === "Belum Dibaca" ? "bg-blue-500" : "bg-gray-200"}`} />
                        <div className="min-w-0">
                          <p className={`text-sm leading-snug ${n.status_baca === "Belum Dibaca" ? "font-bold text-gray-900" : "text-gray-600"}`}>
                            {n.pesan || n.judul || "Notifikasi baru"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.tanggal_fmt || n.created_at || ""}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={onLogout} className="hover:underline transition font-semibold">Logout</button>
        </div>
      </div>
    </nav>
  );
}
