import React, { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";

interface ReminderOption {
  id: string;
  title: string;
  subtitle: string;
  day: number;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const dataPenghuni = {
  nama: "Raja Esa Abdilah",
  kamar: "P07",
  lantai: "Lantai 1",
  tipeKamar: "Kamar Ekonomis",
  status: "Aktif",
};

const reminderOptions: ReminderOption[] = [
  { id: "h-5", title: "H-5", subtitle: "5 hari sebelum jatuh tempo", day: 5 },
  { id: "h-3", title: "H-3", subtitle: "3 hari sebelum jatuh tempo", day: 3 },
  { id: "h-2", title: "H-2", subtitle: "2 hari sebelum jatuh tempo", day: 2 },
  { id: "h-1", title: "H-1", subtitle: "1 hari sebelum jatuh tempo", day: 1 },
];

export default function PengingatTempo() {
  const navigate = useNavigate();

  const namaPenghuni = dataPenghuni.nama;
  const noKamar = dataPenghuni.kamar;

  const [selectedReminder, setSelectedReminder] = useState("h-5");
  const [modalLogout, setModalLogout] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedReminderData = useMemo(
    () => reminderOptions.find((item) => item.id === selectedReminder),
    [selectedReminder],
  );

  const handleLogout = () => {
    localStorage.removeItem("isLoginPenghuni");
    localStorage.removeItem("namaPenghuni");
    navigate("/login");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        <PageHeader
          eyebrow="Pengingat Pembayaran"
          title="Pengingat Jatuh Tempo"
          description="Atur pengingat otomatis agar penghuni mendapatkan informasi sebelum tanggal jatuh tempo pembayaran kos."
          icon={<BellIcon />}
        />

        <InformasiPenghuni />

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Pilih Waktu Pengingat" />

          <form onSubmit={handleSubmit} className="p-7">
            <p className="text-sm text-gray-400 mb-4">
              Pengingat akan dikirim sesuai pilihan hari sebelum jatuh tempo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reminderOptions.map((item) => {
                const isSelected = selectedReminder === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedReminder(item.id)}
                    className={`text-left rounded-2xl p-5 border bg-white min-h-32
                      hover:-translate-y-0.5 hover:shadow-md active:scale-95
                      transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 ring-4 ring-blue-50"
                          : "border-gray-100 hover:border-blue-200"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-400 leading-snug mt-1">
                          {item.subtitle}
                        </p>
                      </div>

                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-500">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl
                  shadow-md shadow-blue-200 active:scale-95 transition-all duration-200"
              >
                Kirim Pengingat
              </button>
            </div>
          </form>
        </section>
      </main>

      <Modal open={modalSuccess} onClose={() => setModalSuccess(false)}>
        <div className="text-center pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
            <CheckIcon />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Pengingat Berhasil Dikirim
          </h2>

          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pengingat pembayaran untuk {namaPenghuni} kamar {noKamar} akan
            dikirim {selectedReminderData?.day} hari sebelum jatuh tempo.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left">
            <ModalInfoRow label="Nama Penghuni" value={namaPenghuni} />
            <ModalInfoRow label="No Kamar" value={noKamar} />
            <ModalInfoRow
              label="Waktu Pengingat"
              value={selectedReminderData?.title ?? "-"}
              valueClass="text-blue-600"
            />
          </div>

          <button
            type="button"
            onClick={() => setModalSuccess(false)}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm
              font-bold rounded-xl active:scale-95 transition-all duration-200"
          >
            Selesai
          </button>
        </div>
      </Modal>

      <LogoutModal
        open={modalLogout}
        onClose={() => setModalLogout(false)}
        onConfirm={handleLogout}
      />

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
          <Link to="/dashboard-penghuni" className="hover:underline transition">
            Dashboard
          </Link>
          <Link to="/layanan-penghuni" className="hover:underline transition">
            Layanan Penghuni
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="hover:underline transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-md p-7 flex flex-col md:flex-row md:items-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-400 text-sm md:text-base mt-1 max-w-3xl">
          {description}
        </p>
      </div>
    </section>
  );
}

function InformasiPenghuni() {
  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <SectionHeader title="Informasi Penghuni" />

      <div className="p-7 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
          <img
            src={profileImg}
            alt={dataPenghuni.nama}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Penghuni Aktif
          </p>
          <h2 className="text-2xl font-bold text-gray-900">
            {dataPenghuni.nama}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 w-full md:w-auto">
          <InfoText label="Kamar" value={dataPenghuni.kamar} />
          <InfoText label="Lantai" value={dataPenghuni.lantai} />
          <InfoText label="Tipe" value={dataPenghuni.tipeKamar} />
          <InfoText
            label="Status"
            value={dataPenghuni.status}
            valueClass="text-green-600"
          />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-7 py-3.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
        {title}
      </p>
    </div>
  );
}

function InfoText({
  label,
  value,
  valueClass = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-sm font-bold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}

/* Modal, icons */
function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-xl animate-[modalIn_180ms_ease-out]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center transition"
        >
          x
        </button>
        {children}
      </div>
    </div>
  );
}

function LogoutModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Logout?</h2>
      <p className="text-gray-400 text-sm mb-6">
        Apakah kamu yakin ingin keluar dari akun ini?
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all duration-200"
        >
          Ya, Logout
        </button>
      </div>
    </Modal>
  );
}

function ModalInfoRow({
  label,
  value,
  valueClass = "text-gray-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
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
      <path
        d="M18 28.5C18 20.5 23.9 14 32 14s14 6.5 14 14.5v8.1l4.2 8.4H13.8l4.2-8.4v-8.1Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M26 45c.8 3.4 3 5 6 5s5.2-1.6 6-5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 8v4M15 14l3.2 3.2M49 14l-3.2 3.2M10 30h4M50 30h4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9 text-green-500">
      <path
        d="m13 24 7 7 15-16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModalAnimationStyle() {
  return (
    <style>
      {`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}
    </style>
  );
}
