import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getPembayaran } from "../api/pembayaran";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";
import teleponImg from "../assets/telepon.png";

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const statusClass: Record<string, string> = {
  "Valid": "bg-green-50 text-green-600",
  "Lunas": "bg-green-50 text-green-600",
  "Menunggu Validasi": "bg-yellow-50 text-yellow-600",
  "Ditolak": "bg-red-50 text-red-500",
  "Belum Dibayar": "bg-red-50 text-red-500",
};

export default function RiwayatPembayaran() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLogout, setModalLogout] = useState(false);
  const [modalAdmin, setModalAdmin] = useState(false);

  useEffect(() => {
    getPembayaran()
      .then((res) => { if (res.success) setRiwayat(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const totalTerbayar = riwayat.reduce((sum: number, item: any) => sum + (item.jumlah_bayar || 0), 0);
  const totalLunas = riwayat.filter((item: any) => item.status_validasi === "Valid").length;

  const nama = currentUser?.nama || "Penghuni";
  const kamar = riwayat[0]?.kamar?.nomor || "P07";

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader
          eyebrow="Layanan Penghuni"
          title="Riwayat Pembayaran"
          description="Laporan histori pembayaran iuran kost Anda."
          icon={<HistoryIcon />}
        />

        <InformasiPenghuni nama={nama} kamar={kamar} />

        {/* RINGKASAN */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Ringkasan Pembayaran" />
          <div className="p-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard label="Total Terbayar" value={formatRupiah(totalTerbayar)} description="Akumulasi pembayaran" tone="blue" />
            <MetricCard label="Terverifikasi" value={`${totalLunas} Transaksi`} description="Pembayaran valid" tone="green" />
            <MetricCard label="ID Kamar" value={kamar} description="Kamar aktif Anda" tone="blue" />
          </div>
        </section>

        {/* TABEL RIWAYAT */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <HistoryIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detail Transaksi</h2>
                <p className="text-sm font-semibold text-gray-400 mt-1">Histori lengkap pembayaran kost</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate("/dashboard-penghuni")} className="text-blue-600 text-lg font-bold hover:underline">
              ← Kembali
            </button>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-4">
            <div className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tanggal</div>
            <div className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nominal</div>
            <div className="col-span-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Status</div>
          </div>

          {/* TABLE ROWS */}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Memuat riwayat...</div>
          )}
          {!loading && riwayat.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada riwayat pembayaran.</div>
          )}
          <div className="divide-y divide-gray-100">
            {riwayat.map((item: any) => (
              <div key={item.id} className="grid grid-cols-12 items-center px-6 py-5 hover:bg-blue-50/20 transition">
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 text-center leading-tight px-1">
                    {item.tanggal_pembayaran?.slice(5, 7)}/{item.tanggal_pembayaran?.slice(0, 4)}
                  </div>
                  <p className="text-base font-bold text-gray-900">{item.tanggal_pembayaran || "-"}</p>
                </div>
                <div className="col-span-4">
                  <p className="text-base font-bold text-gray-900">{item.jumlah_format || formatRupiah(item.jumlah_bayar || 0)}</p>
                </div>
                <div className="col-span-4 flex justify-end">
                  <span className={`inline-flex min-w-24 items-center justify-center rounded-full px-4 py-2 text-sm font-bold ${statusClass[item.status_validasi] || "bg-gray-50 text-gray-500"}`}>
                    {item.status_validasi || "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BANTUAN */}
        <section className="bg-blue-600 rounded-2xl px-8 py-6 flex flex-col lg:flex-row justify-between items-center text-white shadow-md gap-5">
          <div className="flex gap-5 items-center">
            <div className="bg-white/10 rounded-xl p-3 shrink-0">
              <img src={teleponImg} alt="Telepon" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Butuh bantuan?</h3>
              <p className="text-sm opacity-75 mt-0.5">Hubungi Admin jika ada kendala atau pertanyaan.</p>
            </div>
          </div>
          <button type="button" onClick={() => setModalAdmin(true)} className="bg-white text-blue-600 font-bold px-7 py-2.5 rounded-xl text-sm hover:bg-blue-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0">
            Hubungi Admin
          </button>
        </section>
      </main>

      {/* MODAL ADMIN */}
      <Modal open={modalAdmin} onClose={() => setModalAdmin(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-2">
            <img src={teleponImg} alt="Telepon" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Hubungi Admin</h2>
        </div>
        <ModalRow label="WhatsApp" value="+62 895-3384-75752" valueClass="text-green-600" />
        <ModalRow label="Telepon" value="+62 895-3384-75752" />
        <ModalRow label="Email" value="admin@homia.id" />
        <ModalRow label="Jam Operasional" value="08.00-21.00 WIB" />
        <button className="w-full mt-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">
          Chat via WhatsApp
        </button>
      </Modal>

      <LogoutModal open={modalLogout} onClose={() => setModalLogout(false)} onConfirm={handleLogout} />
      <ModalAnimationStyle />
    </div>
  );
}

// ── SUB COMPONENTS ──────────────────────────────────────────────────

function Navbar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link to="/dashboard-penghuni" className="flex items-center gap-3">
          <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
          <h1 className="text-3xl font-bold text-white tracking-wide">HOMIA</h1>
        </Link>
        <div className="flex gap-8 text-white text-lg md:text-xl items-center">
          <Link to="/dashboard-penghuni" className="hover:underline transition">Dashboard</Link>
          <Link to="/layanan-penghuni" className="hover:underline transition">Layanan Penghuni</Link>
          <button type="button" onClick={onLogout} className="hover:underline transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}

function PageHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-md p-7 flex flex-col md:flex-row md:items-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{eyebrow}</p>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-400 text-sm md:text-base mt-1 max-w-3xl">{description}</p>
      </div>
    </section>
  );
}

function InformasiPenghuni({ nama, kamar }: { nama: string; kamar: string }) {
  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <SectionHeader title="Informasi Penghuni" />
      <div className="p-7 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
          <img src={profileImg} alt={nama} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Penghuni Aktif</p>
          <h2 className="text-2xl font-bold text-gray-900">{nama}</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoText label="Kamar" value={kamar} />
          <InfoText label="Status" value="Aktif" valueClass="text-green-600" />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-7 py-3.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{title}</p>
    </div>
  );
}

function InfoText({ label, value, valueClass = "text-gray-900" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}

function MetricCard({ label, value, description, tone }: { label: string; value: string; description: string; tone: "blue" | "green" | "red" }) {
  const t = {
    blue: { card: "bg-blue-50 border-blue-100", label: "text-blue-500", val: "text-blue-700" },
    green: { card: "bg-green-50 border-green-100", label: "text-green-600", val: "text-green-700" },
    red: { card: "bg-red-50 border-red-100", label: "text-red-500", val: "text-red-600" },
  }[tone];
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${t.card}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>{label}</p>
      <p className={`text-2xl font-bold mt-3 ${t.val}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center transition">x</button>
        {children}
      </div>
    </div>
  );
}

function LogoutModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Logout?</h2>
      <p className="text-gray-400 text-sm mb-6">Apakah kamu yakin ingin keluar dari akun ini?</p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Batal</button>
        <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200">Ya, Logout</button>
      </div>
    </Modal>
  );
}

function ModalRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold text-gray-800 ${valueClass}`}>{value}</span>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 text-blue-600">
      <path d="M18 14h24l8 8v28H18V14Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M42 14v10h10M25 32h18M25 40h18M25 24h8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModalAnimationStyle() {
  return (
    <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
  );
}
