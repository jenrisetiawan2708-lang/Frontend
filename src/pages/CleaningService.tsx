import React, { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";

interface CleaningRequest {
  id: number;
  tanggal: string;
  jam: string;
  catatan: string;
  status: "Diproses" | "Selesai";
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

const initialRequests: CleaningRequest[] = [
  {
    id: 1,
    tanggal: "15 Mei 2026",
    jam: "10.00 WIB",
    catatan: "Untuk bagian dalam lemari tidak usah dibersihkan",
    status: "Diproses",
  },
  {
    id: 2,
    tanggal: "10 Maret 2026",
    jam: "13.00 WIB",
    catatan: "Bersihkan area meja belajar dan kamar mandi",
    status: "Selesai",
  },
  {
    id: 3,
    tanggal: "31 Januari 2026",
    jam: "09.00 WIB",
    catatan: "Pembersihan rutin kamar",
    status: "Selesai",
  },
];

export default function CleaningService() {
  const navigate = useNavigate();

  const namaPenghuni = dataPenghuni.nama;
  const noKamar = dataPenghuni.kamar;

  const [tanggal, setTanggal] = useState("2026-05-15");
  const [jam, setJam] = useState("10:00");
  const [catatan, setCatatan] = useState(
    "Untuk bagian dalam lemari tidak usah dibersihkan"
  );

  const [requests, setRequests] = useState<CleaningRequest[]>(initialRequests);
  const [modalLogout, setModalLogout] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [error, setError] = useState("");

  const formattedTanggal = useMemo(
    () => formatTanggalIndonesia(tanggal),
    [tanggal]
  );

  const formattedJam = useMemo(() => formatJamIndonesia(jam), [jam]);

  const handleLogout = () => {
    localStorage.removeItem("isLoginPenghuni");
    localStorage.removeItem("namaPenghuni");
    navigate("/login");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tanggal.trim() || !jam.trim() || !catatan.trim()) {
      setError("Lengkapi tanggal, jam, dan catatan pengajuan cleaning service.");
      return;
    }

    const newRequest: CleaningRequest = {
      id: Date.now(),
      tanggal: formattedTanggal,
      jam: formattedJam,
      catatan,
      status: "Diproses",
    };

    setRequests((current) => [newRequest, ...current]);
    setError("");
    setModalSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader
          eyebrow="Pengajuan Cleaning Service"
          title="Cleaning Service"
          description="Ajukan jadwal pembersihan kamar dengan tanggal, jam, dan catatan khusus agar admin dapat memproses permintaanmu."
          icon={<CleaningIcon />}
        />

        <InformasiPenghuni />

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Form Pengajuan" />

          <form onSubmit={handleSubmit} className="p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <DateField
                label="Pilih Tanggal"
                value={tanggal}
                onChange={setTanggal}
              />

              <TimeField label="Pilih Jam" value={jam} onChange={setJam} />
            </div>

            <label className="block">
              <span className="block text-base font-bold text-gray-800 mb-2">
                Catatan
              </span>

              <textarea
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                placeholder="Tulis catatan khusus untuk petugas cleaning service"
                rows={4}
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900
                  outline-none transition resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </label>

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
                {requests.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center px-5 py-4 bg-white hover:bg-blue-50/30 transition"
                  >
                    <div className="col-span-4">
                      <p className="font-bold text-gray-900">{item.tanggal}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm font-semibold text-gray-600">
                        {item.jam}
                      </p>
                    </div>

                    <div className="col-span-4 min-w-0">
                      <p className="text-sm text-gray-400 truncate">
                        {item.catatan}
                      </p>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Modal open={modalSuccess} onClose={() => setModalSuccess(false)}>
        <div className="text-center pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
            <CheckIcon />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Pengajuan Berhasil Dikirim
          </h2>

          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pengajuan cleaning service untuk {namaPenghuni} kamar {noKamar}
            berhasil dikirim dan sedang diproses admin.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left">
            <ModalInfoRow label="Tanggal" value={formattedTanggal} />
            <ModalInfoRow label="Jam" value={formattedJam} />
            <ModalInfoRow
              label="Status"
              value="Diproses"
              valueClass="text-orange-500"
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
          <button type="button" onClick={onLogout} className="hover:underline transition">
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

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-base font-bold text-gray-800 mb-2">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900
          outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-base font-bold text-gray-800 mb-2">
        {label}
      </span>

      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base text-gray-900
          outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: CleaningRequest["status"] }) {
  const badgeClass =
    status === "Selesai"
      ? "bg-green-50 text-green-600 border-green-100"
      : "bg-orange-50 text-orange-600 border-orange-100";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-bold ${badgeClass}`}
    >
      {status}
    </span>
  );
}

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
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200
            rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center transition"
          aria-label="Tutup modal"
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

function formatTanggalIndonesia(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatJamIndonesia(value: string) {
  if (!value) return "-";

  return `${value.replace(":", ".")} WIB`;
}

function CleaningIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-blue-600">
      <path
        d="M25 12h14l3 18H22l3-18Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M20 30h24l6 22H14l6-22Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M23 40h18M21 48h22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M17 18h-5M52 18h-5M32 6v-4"
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