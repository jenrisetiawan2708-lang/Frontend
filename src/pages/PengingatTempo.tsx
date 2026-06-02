import React, { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getMyProfile } from "../api/penghuni";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";
import { getAvatarSrc } from "../hooks/useAvatar";

interface ReminderOption { id: string; title: string; subtitle: string; day: number; }
interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

const reminderOptions: ReminderOption[] = [
  { id: "h-5", title: "H-5", subtitle: "5 hari sebelum jatuh tempo", day: 5 },
  { id: "h-3", title: "H-3", subtitle: "3 hari sebelum jatuh tempo", day: 3 },
  { id: "h-2", title: "H-2", subtitle: "2 hari sebelum jatuh tempo", day: 2 },
  { id: "h-1", title: "H-1", subtitle: "1 hari sebelum jatuh tempo", day: 1 },
];


export default function PengingatTempo() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getMyProfile().then((r) => { if (r.success) setProfile(r.data); }).catch(() => {});
  }, []);

  const namaPenghuni = profile?.nama || currentUser?.nama || "Penghuni";
  const noKamar = profile?.kamar?.nomor_kamar || "-";

  const [selectedReminder, setSelectedReminder] = useState("h-5");
  const [modalLogout, setModalLogout] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedReminderData = useMemo(() => reminderOptions.find((i) => i.id === selectedReminder), [selectedReminder]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!selectedReminderData) {
    setError("Pilih waktu pengingat terlebih dahulu.");
    return;
  }
  setError("");
  setModalSuccess(true);
};

return (
  <div className="min-h-screen bg-[#e9eaec]">
    <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader eyebrow="Pengingat Pembayaran" title="Pengingat Jatuh Tempo"
          description="Atur pengingat otomatis agar kamu mendapatkan informasi sebelum tanggal jatuh tempo pembayaran kos."
          icon={<BellIcon />} />

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
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoText label="Kamar" value={noKamar} />
              <InfoText label="Status" value="Aktif" valueClass="text-green-600" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Pilih Waktu Pengingat" />
          <form onSubmit={handleSubmit} className="p-7">
            <p className="text-sm text-gray-400 mb-4">Pengingat akan dikirim sesuai pilihan hari sebelum jatuh tempo.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reminderOptions.map((item) => {
                const isSelected = selectedReminder === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedReminder(item.id)}
                    className={`text-left rounded-2xl p-5 border bg-white min-h-32 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200 ${isSelected ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-100 hover:border-blue-200"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-400 leading-snug mt-1">{item.subtitle}</p>
                      </div>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-500">{error}</div>}

            <div className="mt-8 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-all duration-200">
                Kirim Pengingat
              </button>
            </div>
          </form>
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
            onClick={() => window.open(`https://wa.me/6285124485778?text=Halo Admin HOMIA, saya  ingin bertanya.`, "_blank")}
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
          <h2 className="text-2xl font-bold text-gray-900">Pengingat Berhasil Dikirim</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pengingat untuk {namaPenghuni} kamar {noKamar} akan dikirim {selectedReminderData?.day} hari sebelum jatuh tempo.
          </p>
          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left">
            <ModalInfoRow label="Nama Penghuni" value={namaPenghuni} />
            <ModalInfoRow label="No Kamar" value={noKamar} />
            <ModalInfoRow label="Waktu Pengingat" value={selectedReminderData?.title ?? "-"} valueClass="text-blue-600" />
          </div>
          <button type="button" onClick={() => setModalSuccess(false)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-200">Selesai</button>
        </div>
      </Modal>

      <LogoutModal open={modalLogout} onClose={() => setModalLogout(false)} onConfirm={handleLogout} />
      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
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

function BellIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-blue-600">
      <path d="M18 28.5C18 20.5 23.9 14 32 14s14 6.5 14 14.5v8.1l4.2 8.4H13.8l4.2-8.4v-8.1Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M26 45c.8 3.4 3 5 6 5s5.2-1.6 6-5" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
