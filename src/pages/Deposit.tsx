import { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";

interface FineHistory {
  id: number;
  nama: string;
  nomorKamar: string;
  tanggal: string;
  bulan: string;
  bulanLabel: string;
  status: "Tepat Waktu" | "Telat";
  amount: number;
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

const fineHistory: FineHistory[] = [
  {
    id: 1,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "Mei 2026",
    bulan: "MEI",
    bulanLabel: "Mei 2026",
    status: "Tepat Waktu",
    amount: 1500000,
  },
  {
    id: 2,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "April 2026",
    bulan: "APR",
    bulanLabel: "April 2026",
    status: "Telat",
    amount: 1500000,
  },
  {
    id: 3,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "Maret 2026",
    bulan: "MAR",
    bulanLabel: "Maret 2026",
    status: "Tepat Waktu",
    amount: 1500000,
  },
  {
    id: 4,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "Februari 2026",
    bulan: "FEB",
    bulanLabel: "Februari 2026",
    status: "Telat",
    amount: 1500000,
  },
  {
    id: 5,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "Januari 2026",
    bulan: "JAN",
    bulanLabel: "Januari 2026",
    status: "Tepat Waktu",
    amount: 1500000,
  },
  {
    id: 6,
    nama: dataPenghuni.nama,
    nomorKamar: dataPenghuni.kamar,
    tanggal: "Desember 2025",
    bulan: "DES",
    bulanLabel: "Desember 2025",
    status: "Tepat Waktu",
    amount: 1500000,
  },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function Deposit() {
  const navigate = useNavigate();

  const [modalLogout, setModalLogout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const depositAwal = 2000000;
  const sisaDeposit = 1850000;
  const dendaPerTelat = 150000;

  const telat = fineHistory.filter((item) => item.status === "Telat").length;
  const tepatWaktu = fineHistory.filter(
    (item) => item.status === "Tepat Waktu",
  ).length;
  const totalDenda = useMemo(() => telat * dendaPerTelat, [telat]);
  const depositPercent = Math.round((sisaDeposit / depositAwal) * 100);

  const handleLogout = () => {
    localStorage.removeItem("isLoginPenghuni");
    localStorage.removeItem("namaPenghuni");
    navigate("/login");
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-[#e9eaec]">
        <Navbar onLogout={() => setModalLogout(true)} />

        <main className="max-w-7xl mx-auto px-6 py-7">
          <TransactionTable
            data={fineHistory}
            onBack={() => setShowHistory(false)}
          />
        </main>

        <LogoutModal
          open={modalLogout}
          onClose={() => setModalLogout(false)}
          onConfirm={handleLogout}
        />
        <ModalAnimationStyle />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader
          eyebrow="Layanan Penghuni"
          title="Deposit & Denda"
          description="Kelola informasi deposit dan pantau riwayat pembayaran."
          icon={<DepositIcon />}
        />

        <InformasiPenghuni />

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader title="Ringkasan Deposit" />

          <div className="p-7 space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Sisa Deposit
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {formatRupiah(sisaDeposit)}
              </p>
              <p className="text-sm font-semibold text-gray-400 mt-1">
                dari {formatRupiah(depositAwal)}
              </p>

              <div className="mt-5">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                  <span>Saldo Tersisa</span>
                  <span>{depositPercent}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${depositPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Deposit Awal"
                value={formatRupiah(depositAwal)}
                description="Dibayarkan saat awal masuk"
                tone="blue"
              />
              <MetricCard
                label="Sisa Deposit"
                value={formatRupiah(sisaDeposit)}
                description={`${depositPercent}% dari deposit awal`}
                tone="green"
              />
              <MetricCard
                label="Total Denda"
                value={formatRupiah(totalDenda)}
                description={`${telat} kali keterlambatan`}
                tone="red"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <SectionHeader
            title="Riwayat Terbaru"
            action={
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Lihat Semua
              </button>
            }
          />

          <div className="p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label="Total Transaksi"
                value={String(fineHistory.length)}
                description="Semua histori pembayaran"
                tone="blue"
              />
              <MetricCard
                label="Tepat Waktu"
                value={String(tepatWaktu)}
                description="Pembayaran sesuai jadwal"
                tone="green"
              />
              <MetricCard
                label="Terlambat"
                value={String(telat)}
                description="Pembayaran melewati tempo"
                tone="red"
              />
            </div>

            <TransactionPreview data={fineHistory.slice(0, 4)} />

            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl
                shadow-md shadow-blue-200 active:scale-95 transition-all duration-200"
            >
              Lihat Riwayat Lengkap
            </button>
          </div>
        </section>
      </main>

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

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-blue-50 border-b border-blue-100 px-7 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
          {title}
        </p>
      </div>
      {action}
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

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: "blue" | "green" | "red";
}) {
  const toneClass = {
    blue: {
      card: "bg-blue-50 border-blue-100 hover:shadow-blue-100",
      label: "text-blue-500",
      value: "text-blue-700",
    },
    green: {
      card: "bg-green-50 border-green-100 hover:shadow-green-100",
      label: "text-green-600",
      value: "text-green-700",
    },
    red: {
      card: "bg-red-50 border-red-100 hover:shadow-red-100",
      label: "text-red-500",
      value: "text-red-600",
    },
  }[tone];

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${toneClass.card}`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-widest ${toneClass.label}`}
      >
        {label}
      </p>
      <p className={`text-2xl font-bold mt-3 ${toneClass.value}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function TransactionPreview({ data }: { data: FineHistory[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-4">
        <div className="col-span-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Bulan
        </div>
        <div className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Nominal
        </div>
        <div className="col-span-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
          Status
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {data.map((item) => (
          <TransactionRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function TransactionTable({
  data,
  onBack,
}: {
  data: FineHistory[];
  onBack: () => void;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <HistoryIcon />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Transaksi
            </h1>
            <p className="text-sm font-semibold text-gray-400 mt-1">
              Histori lengkap pembayaran kost
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-blue-600 text-lg font-bold hover:underline"
        >
          ← Kembali
        </button>
      </div>

      <TransactionPreview data={data} />
    </section>
  );
}

function TransactionRow({ item }: { item: FineHistory }) {
  const statusLabel = item.status === "Tepat Waktu" ? "Lunas" : "Telat";

  return (
    <div className="grid grid-cols-12 items-center px-6 py-5 hover:bg-blue-50/20 transition">
      <div className="col-span-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
          {item.bulan}
        </div>
        <p className="text-base font-bold text-gray-900">{item.bulanLabel}</p>
      </div>

      <div className="col-span-4">
        <p className="text-base font-bold text-gray-900">
          {formatRupiah(item.amount)}
        </p>
      </div>

      <div className="col-span-3 flex justify-end">
        <PaymentStatusBadge status={statusLabel} />
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: "Lunas" | "Telat" }) {
  const badgeClass =
    status === "Lunas"
      ? "bg-green-50 text-green-600"
      : "bg-red-50 text-red-500";

  return (
    <span
      className={`inline-flex min-w-24 items-center justify-center rounded-full px-4 py-2 text-sm font-bold ${badgeClass}`}
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

function DepositIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-blue-600">
      <path
        d="M12 22h40v28H12V22Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M18 22v-8h34v28h-6"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M32 42a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M18 29h4M42 43h4"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 text-blue-600">
      <path
        d="M18 14h24l8 8v28H18V14Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M42 14v10h10M25 32h18M25 40h18M25 24h8"
        stroke="currentColor"
        strokeWidth="4"
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
