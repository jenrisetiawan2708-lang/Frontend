import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ASSETS
import heroImg from "../assets/logo-navbar.png";
import forumkomunikasi from "../assets/forum-komunikasi.png";
import jatuhtempo from "../assets/jatuh-tempo.png";
import cleaning from "../assets/cleaning.png";
import depositdenda from "../assets/deposit-denda.png";
import telepon from "../assets/telepon.png";

// ── TYPES ──
interface LayananItem {
  id: number;
  image: string;
  label: string;
  desc: string;
  route: string;
  color: string;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalRowProps {
  label: string;
  value: string;
  valueClass?: string;
}

// ── DATA LAYANAN ──
const daftarLayanan: LayananItem[] = [
  {
    id: 1,
    image: forumkomunikasi,
    label: "Forum Komunikasi",
    desc: "Wadah komunikasi antar penghuni untuk berbagi informasi dan berdiskusi dengan mudah",
    route: "/forumkomunikasi",
    color: "bg-blue-50",
  },
  {
    id: 2,
    image: depositdenda,
    label: "Deposit Denda",
    desc: "Fitur untuk mengelola uang deposit, dibayarkan di awal serta mencatat denda jika terjadi kerusakan atau keterlambatan pembayaran",
    route: "/depositdenda",
    color: "bg-purple-50",
  },
  {
    id: 3,
    image: jatuhtempo,
    label: "Jatuh Tempo",
    desc: "Memberikan Notifikasi kepada penghuni terkait jadwal pembayaran kos",
    route: "/jatuhtempo",
    color: "bg-green-50",
  },
  {
    id: 4,
    image: cleaning,
    label: "Cleaning Service",
    desc: "Fitur yang memungkinkan penghuni mengajukan permintaan pembersihan kamar",
    route: "/cleaningservice",
    color: "bg-orange-50",
  },
];

// ── MAIN PAGE ──
export default function LayananPenghuni() {
  const navigate = useNavigate();
  const [modalAdmin, setModalAdmin] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoginPenghuni");
    localStorage.removeItem("namaPenghuni");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      {/* ── NAVBAR ── */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/dashboard-penghuni" className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
            <h1 className="text-3xl font-extrabold text-white tracking-wide">
              HOMIA
            </h1>
          </Link>

          <div className="flex gap-8 text-white text-xl items-center">
            <Link
              to="/dashboard-penghuni"
              className="hover:underline transition"
            >
              Dashboard
            </Link>
            <Link to="/layanan-penghuni" className="hover:underline transition">
              Layanan Penghuni
            </Link>
            <button
              onClick={() => setModalLogout(true)}
              className="hover:underline transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* HEADER */}
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Menu Utama
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Layanan Penghuni
          </h1>
          <p className="text-base text-gray-400 mt-1">
            Akses semua layanan kost kamu dalam satu tempat.
          </p>
        </section>

        {/* GRID LAYANAN */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {daftarLayanan.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="bg-white rounded-2xl p-6 shadow-sm text-left flex flex-col gap-4
                border-2 border-transparent
                hover:-translate-y-1 hover:shadow-lg hover:border-blue-100
                active:scale-95 transition-all duration-200 w-full"
            >
              <div className={`${item.color} rounded-xl p-3 w-fit`}>
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-base">
                  {item.label}
                </p>
                <p className="text-gray-400 text-sm mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>
              <span className="text-blue-500 text-xs font-semibold mt-auto">
                Buka →
              </span>
            </button>
          ))}
        </section>

        {/* INFO KAMAR */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-100 px-7 py-3.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shrink-0" />
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
              Informasi Kamar Saya
            </p>
          </div>

          <div className="p-7 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Nomor kamar */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-2xl p-6 text-center w-40 shrink-0 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">
                Kamar
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight">P07</h2>
            </div>

            {/* Detail */}
            <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full">
              <InfoRow label="Lantai" value="Lantai 1" />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <InfoRow label="Tipe Kamar" value="Kamar Ekonomis" />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <InfoRow
                label="Status"
                value="Aktif"
                valueClass="text-green-500"
              />
              <div className="hidden sm:block w-px bg-gray-100 self-stretch" />
              <InfoRow
                label="Jatuh Tempo"
                value="10 Mei 2026"
                valueClass="text-red-500"
              />
            </div>
          </div>
        </section>

        {/* BANTUAN */}
        <section
          className="bg-blue-600 rounded-2xl px-8 py-6 flex flex-col lg:flex-row
          justify-between items-center text-white shadow-md gap-5"
        >
          <div className="flex gap-5 items-center">
            <div className="bg-white/10 rounded-xl p-3 shrink-0">
              <img
                src={telepon}
                alt="Telepon"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">Butuh bantuan?</h3>
              <p className="text-sm opacity-75 mt-0.5">
                Hubungi Admin jika ada kendala atau pertanyaan.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalAdmin(true)}
            className="bg-white text-blue-600 font-bold px-7 py-2.5 rounded-xl text-sm
              hover:bg-blue-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0"
          >
            Hubungi Admin
          </button>
        </section>
      </main>

      {/* ── MODAL HUBUNGI ADMIN ── */}
      <Modal open={modalAdmin} onClose={() => setModalAdmin(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-2">
            <img
              src={telepon}
              alt="Telepon"
              className="w-8 h-8 object-contain"
            />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Hubungi Admin
          </h2>
        </div>

        <ModalRow
          label="WhatsApp"
          value="+62 895-3384-75752"
          valueClass="text-green-600"
        />
        <ModalRow label="Telepon" value="+62 895-3384-75752" />
        <ModalRow label="Email" value="admin@homia.id" />
        <ModalRow label="Jam Operasional" value="08.00–21.00 WIB" />

        <button
          className="w-full mt-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm
          font-bold rounded-xl active:scale-95 transition-all duration-200"
        >
          Chat via WhatsApp
        </button>
      </Modal>

      {/* ── MODAL LOGOUT ── */}
      <Modal open={modalLogout} onClose={() => setModalLogout(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Logout?</h2>
        <p className="text-gray-400 text-sm mb-6">
          Apakah kamu yakin ingin keluar dari akun ini?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setModalLogout(false)}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm
              font-semibold rounded-xl active:scale-95 transition-all duration-200"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm
              font-semibold rounded-xl active:scale-95 transition-all duration-200"
          >
            Ya, Logout
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── INFO ROW ──
function InfoRow({
  label,
  value,
  valueClass = "text-gray-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`text-base font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

// ── MODAL ──
function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200
            rounded-lg text-sm flex items-center justify-center transition"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

// ── MODAL ROW ──
function ModalRow({ label, value, valueClass = "" }: ModalRowProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold text-gray-800 ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
