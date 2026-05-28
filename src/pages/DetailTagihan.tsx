import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { getTagihan } from "../api/tagihan";
import { getPembayaran } from "../api/pembayaran";

import heroImg from "../assets/logo-navbar.png";
import telepon from "../assets/telepon.png";
import tagihan from "../assets/tagihan.png";
import riwayat from "../assets/riwayat.png";

interface ModalProps { open: boolean; onClose: () => void; children: React.ReactNode; }
interface ModalRowProps { label: string; value: string; valueClass?: string; }

const statusConfig: Record<string, string> = {
  "Lunas": "bg-green-100 text-green-600",
  "Belum Dibayar": "bg-red-100 text-red-500",
  "Belum Bayar": "bg-red-100 text-red-500",
  "Terlambat": "bg-orange-100 text-orange-500",
};

export default function Pembayaran() {
  const navigate = useNavigate();

  const [modalAdmin, setModalAdmin] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [riwayatList, setRiwayatList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTagihan(), getPembayaran()])
      .then(([tagRes, bayarRes]) => {
        if (tagRes.success) setTagihanList(tagRes.data);
        if (bayarRes.success) setRiwayatList(bayarRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const tagihanAktif = tagihanList.find((t: any) => t.status_tagihan === "Belum Dibayar") || tagihanList[0];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Hitung hari lagi ke jatuh tempo
  const hitungHariLagi = (jatuhTempo: string) => {
    if (!jatuhTempo) return 0;
    const today = new Date();
    const tempo = new Date(jatuhTempo);
    const diff = Math.ceil((tempo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const hariLagi = hitungHariLagi(tagihanAktif?.jatuh_tempo || "");

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
          <h1 className="text-4xl font-extrabold text-gray-900">Pembayaran</h1>
          <p className="text-base text-gray-400 mt-1">Kelola dan bayar tagihan kost kamu di sini.</p>
        </section>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data tagihan...</div>
        ) : (
          <>
            {/* INFO KAMAR + TAGIHAN */}
            <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6">
              {/* INFO KAMAR */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 bg-blue-50 border-b border-blue-100 px-6 py-3.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Informasi Kamar</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-xl px-5 py-3 text-center shadow-sm shrink-0">
                      <p className="text-xs opacity-75 font-semibold uppercase tracking-widest">Kamar</p>
                      <p className="text-3xl font-extrabold tracking-tight">{tagihanAktif?.kamar?.nomor || "P07"}</p>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Bulan</p>
                        <p className="text-sm font-bold text-gray-800">{tagihanAktif?.bulan_label || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Penghuni</p>
                        <p className="text-sm font-bold text-gray-800">{tagihanAktif?.penghuni?.nama || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-500 font-medium">Status Pembayaran</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig[tagihanAktif?.status_tagihan] || "bg-gray-100 text-gray-500"}`}>
                      {tagihanAktif?.status_tagihan || "Tidak Diketahui"}
                    </span>
                  </div>
                </div>
              </div>

              {/* TAGIHAN AKTIF */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 px-6 py-3.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Tagihan Bulan Ini</p>
                </div>
                <div className="p-6">
                  {hariLagi > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-5">
                      <span className="text-blue-500 text-base">🔔</span>
                      <p className="text-sm text-blue-600 font-semibold">
                        Pembayaran jatuh tempo dalam <span className="font-extrabold">{hariLagi} hari</span> lagi.
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Tagihan</p>
                      <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        {tagihanAktif?.total_format || "Rp 0"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Jatuh Tempo</span>
                        <span className="text-sm font-bold text-red-500">{tagihanAktif?.jatuh_tempo || "-"}</span>
                      </div>
                    </div>
                    <img src={tagihan} alt="Tagihan" className="w-16 h-16 object-contain opacity-70 shrink-0" />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/form-pembayaran")}
                    className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3.5 rounded-xl active:scale-95 transition-all duration-200 shadow-sm"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            </section>

            {/* RIWAYAT PEMBAYARAN */}
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 border-b border-gray-100 px-6 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 rounded-lg p-1.5">
                    <img src={riwayat} alt="Riwayat" className="w-5 h-5 object-contain" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Riwayat Pembayaran</p>
                </div>
                <button onClick={() => navigate("/riwayat")} className="text-blue-500 text-xs font-bold hover:underline transition">Lihat Semua →</button>
              </div>

              <div className="grid grid-cols-3 px-6 py-3 bg-blue-600 text-white text-sm font-bold">
                <span>Bulan</span>
                <span className="text-center">Jumlah</span>
                <span className="text-right">Status</span>
              </div>

              <div className="divide-y divide-gray-50">
                {riwayatList.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada riwayat pembayaran.</div>
                )}
                {riwayatList.slice(0, 4).map((item: any, idx: number) => (
                  <div key={item.id} className={`grid grid-cols-3 px-6 py-4 items-center transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/40`}>
                    <span className="text-sm font-semibold text-gray-700">{item.tanggal_pembayaran || "-"}</span>
                    <span className="text-sm font-semibold text-gray-700 text-center">{item.jumlah_format || "-"}</span>
                    <div className="flex justify-end">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusConfig[item.status_validasi] || "bg-gray-100 text-gray-500"}`}>
                        {item.status_validasi || "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
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
        <button className="w-full mt-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">Chat via WhatsApp</button>
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
