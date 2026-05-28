import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { getPengumuman } from "../api/pengumuman";
import { tandaiBaca } from "../api/notifikasi";

import heroImg from "../assets/logo-navbar.png";
import pengumumanImg from "../assets/pengumuman.png";
import telepon from "../assets/telepon.png";

interface ModalProps { open: boolean; onClose: () => void; children: React.ReactNode; }
interface ModalRowProps { label: string; value: string; valueClass?: string; }

export default function PengumumanPenghuni() {
  const navigate = useNavigate();

  const [daftarPengumuman, setDaftarPengumuman] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPengumuman()
      .then((res) => { if (res.success) setDaftarPengumuman(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleOpenPengumuman = async (item: any) => {
    setSelected(item);
    // Tandai sebagai dibaca jika belum
    if (item.status_baca === "Belum Dibaca") {
      try {
        await tandaiBaca(item.id);
        setDaftarPengumuman((prev) =>
          prev.map((p) => p.id === item.id ? { ...p, status_baca: "Dibaca" } : p)
        );
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/dashboard-penghuni" className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
            <h1 className="text-3xl font-extrabold text-white tracking-wide">HOMIA</h1>
          </Link>
          <div className="flex gap-8 text-white text-xl items-center">
            <Link to="/dashboard-penghuni" className="hover:underline transition">Dashboard</Link>
            <Link to="/layanan-penghuni" className="hover:underline transition">Layanan Penghuni</Link>
            <button onClick={() => setModalLogout(true)} className="hover:underline transition">Logout</button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Layanan Penghuni</p>
          <h1 className="text-4xl font-extrabold text-gray-900">Pengumuman</h1>
          <p className="text-base text-gray-400 mt-1">Informasi terbaru untuk seluruh penghuni kost.</p>
        </section>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat pengumuman...</div>
        ) : daftarPengumuman.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm">
            <img src={pengumumanImg} alt="Pengumuman" className="w-16 h-16 mx-auto opacity-40 mb-4" />
            <p className="font-semibold">Belum ada pengumuman saat ini.</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {daftarPengumuman.map((item: any) => (
              <button
                key={item.id}
                onClick={() => handleOpenPengumuman(item)}
                className="bg-white rounded-2xl p-5 shadow-sm text-left flex gap-4 items-start relative
                  border-2 border-transparent hover:-translate-y-1 hover:shadow-lg hover:border-blue-100
                  active:scale-95 transition-all duration-200 w-full"
              >
                {/* Badge belum dibaca */}
                {item.status_baca === "Belum Dibaca" && (
                  <span className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Baru</span>
                )}

                <div className="bg-blue-50 rounded-xl p-3 shrink-0">
                  <img src={pengumumanImg} alt="Pengumuman" className="w-10 h-10 object-contain" />
                </div>

                <div className="pr-12 min-w-0">
                  <h4 className="font-bold text-gray-800 text-base leading-snug">Pengumuman</h4>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed line-clamp-2">{item.pesan}</p>
                  <p className="text-blue-400 text-xs mt-2 font-semibold">
                    {item.tanggal_kirim ? new Date(item.tanggal_kirim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                  </p>
                </div>
              </button>
            ))}
          </section>
        )}

        {/* BANTUAN */}
        <section className="bg-blue-600 rounded-2xl px-8 py-6 flex flex-col lg:flex-row justify-between items-center text-white shadow-md gap-5">
          <div className="flex gap-5 items-center">
            <div className="bg-white/10 rounded-xl p-3 shrink-0">
              <img src={telepon} alt="Telepon" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Butuh bantuan?</h3>
              <p className="text-sm opacity-75 mt-0.5">Hubungi Admin jika ada kendala atau pertanyaan.</p>
            </div>
          </div>
          <button onClick={() => setModalAdmin(true)} className="bg-white text-blue-600 font-bold px-7 py-2.5 rounded-xl text-sm hover:bg-blue-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0">
            Hubungi Admin
          </button>
        </section>
      </main>

      {/* MODAL DETAIL PENGUMUMAN */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <img src={pengumumanImg} alt="Pengumuman" className="w-9 h-9 object-contain" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Pengumuman</span>
              <span className="text-xs text-gray-400 font-medium">
                {selected.tanggal_kirim ? new Date(selected.tanggal_kirim).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">{selected.pesan}</p>
            <button onClick={() => setSelected(null)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">
              Tutup
            </button>
          </>
        )}
      </Modal>

      {/* MODAL HUBUNGI ADMIN */}
      <Modal open={modalAdmin} onClose={() => setModalAdmin(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-2">
            <img src={telepon} alt="Telepon" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Hubungi Admin</h2>
        </div>
        <ModalRow label="WhatsApp" value="+62 895-3384-75752" valueClass="text-green-600" />
        <ModalRow label="Telepon" value="+62 895-3384-75752" />
        <ModalRow label="Email" value="admin@homia.id" />
        <ModalRow label="Jam Operasional" value="08.00–21.00 WIB" />
        <button className="w-full mt-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">
          Chat via WhatsApp
        </button>
      </Modal>

      {/* MODAL LOGOUT */}
      <Modal open={modalLogout} onClose={() => setModalLogout(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Logout?</h2>
        <p className="text-gray-400 text-sm mb-6">Apakah kamu yakin ingin keluar dari akun ini?</p>
        <div className="flex gap-3">
          <button onClick={() => setModalLogout(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Batal</button>
          <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Ya, Logout</button>
        </div>
      </Modal>
    </div>
  );
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center transition">✕</button>
        {children}
      </div>
    </div>
  );
}

function ModalRow({ label, value, valueClass = "" }: ModalRowProps) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold text-gray-800 ${valueClass}`}>{value}</span>
    </div>
  );
}
