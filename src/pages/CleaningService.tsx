import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getMyProfile } from "../api/penghuni";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";
import { getAvatarSrc } from "../hooks/useAvatar";

interface CleaningRequest {
  id: number;
  tanggal: string;
  jam: string;
  catatan: string;
  status: "Diproses" | "Selesai";
}

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

const WA_NUMBER = "6289533847575";

export default function CleaningService() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getMyProfile().then((r) => { if (r.success) setProfile(r.data); }).catch(() => {});
  }, []);

  const namaPenghuni = profile?.nama || currentUser?.nama || "Penghuni";
  const noKamar = profile?.kamar?.nomor_kamar || "-";

  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("10:00");
  const [catatan, setCatatan] = useState("");
  const [requests, setRequests] = useState<CleaningRequest[]>([]);
  const [modalLogout, setModalLogout] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [error, setError] = useState("");

  const formattedTanggal = useMemo(() => formatTanggalIndonesia(tanggal), [tanggal]);
  const formattedJam = useMemo(() => formatJamIndonesia(jam), [jam]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tanggal.trim() || !jam.trim() || !catatan.trim()) {
      setError("Lengkapi tanggal, jam, dan catatan pengajuan cleaning service.");
      return;
    }
    const newRequest: CleaningRequest = { id: Date.now(), tanggal: formattedTanggal, jam: formattedJam, catatan, status: "Diproses" };
    setRequests((current) => [newRequest, ...current]);
    setError("");
    setModalSuccess(true);
  };

  {
    window.open(`https://wa.me/${WA_NUMBER}?text=Halo Admin HOMIA, saya ${namaPenghuni} ingin menanyakan tentang cleaning service.`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader eyebrow="Pengajuan Cleaning Service" title="Cleaning Service"
          description="Ajukan jadwal pembersihan kamar dengan tanggal, jam, dan catatan khusus."
          icon={<CleaningIcon />} />

        {/* INFO PENGHUNI */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Informasi Penghuni" />
          <div className="p-7 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
              <img src={getAvatarSrc(profileImg)} alt={namaPenghuni} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Penghuni Aktif</p>
              <h2 className="text-2xl font-bold text-gray-900">{namaPenghuni}</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full md:w-auto">
              <InfoText label="Kamar" value={noKamar} />
              <InfoText label="Status" value="Aktif" valueClass="text-green-600" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Form Pengajuan" />
          <form onSubmit={handleSubmit} className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <label className="block">
                <span className="block text-base font-bold text-gray-800 mb-2">Pilih Tanggal</span>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
              </label>
              <label className="block">
                <span className="block text-base font-bold text-gray-800 mb-2">Pilih Jam</span>
                <input type="time" value={jam} onChange={(e) => setJam(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
              </label>
            </div>
            <label className="block">
              <span className="block text-base font-bold text-gray-800 mb-2">Catatan</span>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tulis catatan khusus untuk petugas cleaning service" rows={4}
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
            </label>
            {error && <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-500">{error}</div>}
            <div className="mt-8 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-all duration-200">
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Riwayat Pengajuan" />
          <div className="p-7">
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <div className="grid grid-cols-12 bg-blue-50 border-b border-blue-100 px-5 py-3 text-xs font-bold text-blue-500 uppercase tracking-widest">
                <div className="col-span-4">Tanggal</div>
                <div className="col-span-2">Jam</div>
                <div className="col-span-4">Catatan</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              <div className="divide-y divide-gray-100">
                {requests.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada pengajuan</div>}
                {requests.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center px-5 py-4 bg-white hover:bg-blue-50/30 transition">
                    <div className="col-span-4"><p className="font-bold text-gray-900">{item.tanggal}</p></div>
                    <div className="col-span-2"><p className="text-sm font-semibold text-gray-600">{item.jam}</p></div>
                    <div className="col-span-4 min-w-0"><p className="text-sm text-gray-400 truncate">{item.catatan}</p></div>
                    <div className="col-span-2 flex justify-end">
                      <span className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-bold ${item.status === "Selesai" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BANTUAN */}
        <section className="bg-blue-600 rounded-2xl px-8 py-6 flex flex-col lg:flex-row justify-between items-center text-white shadow-md gap-5">
          <div className="flex gap-5 items-center">
            <div className="bg-white/10 rounded-xl p-3 shrink-0">
            </div>
            <div>
              <h3 className="text-lg font-bold">Butuh bantuan?</h3>
              <p className="text-sm opacity-75 mt-0.5">Hubungi Admin jika ada kendala atau pertanyaan.</p>
            </div>
          </div>
          <button
            onClick={() => window.open(`https://wa.me/6285124485778?text=Halo Admin HOMIA, saya ${namaPenghuni} ingin bertanya.`, "_blank")}
            className="bg-white text-green-600 font-bold px-7 py-2.5 rounded-xl text-sm hover:bg-green-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0 flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.524 5.849L0 24l6.337-1.508A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.49-5.193-1.346L3 22l1.376-3.701A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Hubungi Admin
          </button>
        </section>
      </main>


      <Modal open={modalSuccess} onClose={() => setModalSuccess(false)}>
        <div className="text-center pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
            <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9 text-green-500"><path d="m13 24 7 7 15-16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pengajuan Berhasil Dikirim</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pengajuan cleaning service untuk {namaPenghuni} kamar {noKamar} berhasil dikirim.
          </p>
          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left">
            <ModalInfoRow label="Tanggal" value={formattedTanggal} />
            <ModalInfoRow label="Jam" value={formattedJam} />
            <ModalInfoRow label="Status" value="Diproses" valueClass="text-orange-500" />
          </div>
          <button type="button" onClick={() => setModalSuccess(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">Selesai</button>
        </div>
      </Modal>

      <LogoutModal open={modalLogout} onClose={() => setModalLogout(false)} onConfirm={handleLogout} />
      <ModalAnimationStyle />
    </div>
  );
}

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
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
        <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Ya, Logout</button>
      </div>
    </Modal>
  );
}

function ModalInfoRow({ label, value, valueClass = "text-gray-800" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function formatTanggalIndonesia(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatJamIndonesia(value: string) {
  if (!value) return "-";
  return `${value.replace(":", ".")} WIB`;
}

function CleaningIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-blue-600">
      <path d="M25 12h14l3 18H22l3-18Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M20 30h24l6 22H14l6-22Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M23 40h18M21 48h22" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

function ModalAnimationStyle() {
  return <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>;
}
