import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getTagihan } from "../api/tagihan";
import { uploadBuktiPembayaran } from "../api/pembayaran";
import { bayarDenganMidtrans } from "../api/midtrans";

import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";
import { getAvatarSrc } from "../hooks/useAvatar";

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export default function FormPembayaran() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [bank, setBank] = useState("BCA");
  const [noRekening, setNoRekening] = useState("");
  const [buktiFile, setBuktiFile] = useState("");
  const [buktiFileObj, setBuktiFileObj] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMidtransLoading, setIsMidtransLoading] = useState(false);

  // Data dari backend
  const [tagihanAktif, setTagihanAktif] = useState<any>(null);
  const [loadingTagihan, setLoadingTagihan] = useState(true);

  useEffect(() => {
    getTagihan()
      .then((res) => {
        if (res.success) {
          const aktif = res.data.find((t: any) => t.status_tagihan === "Belum Dibayar");
          setTagihanAktif(aktif || null);
        }
      })
      .finally(() => setLoadingTagihan(false));
  }, []);

  const namaPenghuni = currentUser?.nama || "Penghuni";
  const noKamar = tagihanAktif?.kamar?.nomor || "P07";
  const totalTagihan = tagihanAktif?.total || 0;
  const jatuhTempo = tagihanAktif?.jatuh_tempo || "-";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBuktiFile(file.name);
      setBuktiFileObj(file);
    }
  };

  // ── Upload Bukti Manual ───────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!tagihanAktif) {
      setError("Tidak ada tagihan aktif untuk dibayar.");
      return;
    }
    if (!buktiFileObj) {
      setError("Lengkapi bank, nomor rekening, dan upload bukti transfer.");
      return;
    }
    if (!noRekening.trim()) {
      setError("Nomor rekening wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await uploadBuktiPembayaran({
        id_tagihan: tagihanAktif.id,
        jumlah_bayar: totalTagihan,
        bukti: buktiFileObj,
        tanggal_pembayaran: new Date().toISOString().split("T")[0],
      });
      setModalSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal upload bukti. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Bayar via Midtrans ────────────────────────────────────────────
  const handleBayarMidtrans = async () => {
    setError("");

    if (!tagihanAktif) {
      setError("Tidak ada tagihan aktif untuk dibayar.");
      return;
    }

    setIsMidtransLoading(true);
    try {
      await bayarDenganMidtrans(tagihanAktif.id, {
        onSuccess: () => {
          setIsMidtransLoading(false);
          setModalSuccess(true);
        },
        onPending: () => {
          setIsMidtransLoading(false);
          setError("Pembayaran pending. Selesaikan pembayaran sesuai instruksi.");
        },
        onError: () => {
          setIsMidtransLoading(false);
          setError("Pembayaran gagal. Coba lagi.");
        },
        onClose: () => {
          setIsMidtransLoading(false);
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuka payment gateway.");
      setIsMidtransLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <Navbar onLogout={() => setModalLogout(true)} />

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">
        <PageHeader
          eyebrow="Pembayaran"
          title="Konfirmasi Pembayaran"
          description="Upload bukti transfer atau bayar langsung via payment gateway."
          icon={<PaymentIcon />}
        />

        <InformasiPenghuni nama={namaPenghuni} kamar={noKamar} />

        {loadingTagihan ? (
          <div className="text-center py-12 text-gray-400">Memuat data tagihan...</div>
        ) : !tagihanAktif ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-6 text-center">
            <p className="text-green-600 font-bold text-lg">✅ Semua tagihan sudah lunas!</p>
            <p className="text-green-500 text-sm mt-1">Tidak ada tagihan yang perlu dibayar saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-6">
              {/* ── BAYAR VIA MIDTRANS ── */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <SectionHeader title="Bayar via Payment Gateway (Midtrans)" />
                <div className="p-7 space-y-4">
                  <p className="text-sm text-gray-500">
                    Bayar langsung menggunakan transfer bank, QRIS, GoPay, ShopeePay, Indomaret, dan lainnya — tanpa perlu upload bukti manual.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["BCA VA", "BNI VA", "BRI VA", "GoPay", "ShopeePay", "QRIS", "Alfamart"].map((m) => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full font-semibold">{m}</span>
                    ))}
                  </div>
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-semibold text-red-500">{error}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleBayarMidtrans}
                    disabled={isMidtransLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isMidtransLoading ? "Membuka Payment Gateway..." : `Bayar ${formatRupiah(totalTagihan)} Sekarang`}
                  </button>
                </div>
              </div>

              {/* ── ATAU UPLOAD BUKTI MANUAL ── */}
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <SectionHeader title="Atau Upload Bukti Transfer Manual" />
                <div className="p-7 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Metode Pembayaran">
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      >
                        <optgroup label="Transfer Bank">
                          {["BCA", "BRI", "BNI", "Mandiri", "BSI"].map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                        <optgroup label="E-Wallet">
                          {["GoPay", "ShopeePay", "OVO", "Dana"].map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Lainnya">
                          {["QRIS", "Indomaret", "Alfamart"].map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </optgroup>
                      </select>
                    </Field>

                    <Field label="No Rekening / No Akun">
                      <input
                        value={noRekening}
                        onChange={(e) => setNoRekening(e.target.value)}
                        placeholder="No rekening / no akun e-wallet"
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />
                    </Field>
                  </div>

                  <Field label="Bukti Pembayaran">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className={`flex-1 rounded-xl border px-4 py-3 text-base min-w-0 ${buktiFile ? "border-green-200 bg-green-50 text-green-700" : "border-blue-200 bg-white text-gray-400"}`}>
                        <p className="truncate font-semibold">{buktiFile || "Belum ada file dipilih"}</p>
                      </div>
                      <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold px-6 py-3 rounded-xl text-center active:scale-95 transition-all shrink-0">
                        Upload Bukti
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                    {buktiFile && <p className="text-sm text-green-600 font-semibold mt-2">File siap dikirim: {buktiFile}</p>}
                  </Field>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Mengirim..." : "Konfirmasi Pembayaran"}
                  </button>
                </div>
              </form>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-5">
              <section className="bg-white rounded-2xl shadow-md overflow-hidden">
                <SectionHeader title="Detail Tagihan" />
                <div className="p-6 space-y-3">
                  <InfoRow label="Nomor Kamar" value={noKamar} />
                  <InfoRow label="Bulan" value={tagihanAktif?.bulan_label || "-"} />
                  <InfoRow label="Status" value={tagihanAktif?.status_tagihan || "-"} valueClass="text-red-500" />
                  <InfoRow label="Jatuh Tempo" value={jatuhTempo} valueClass="text-red-500" />
                  {tagihanAktif?.denda > 0 && (
                    <InfoRow label="Denda" value={formatRupiah(tagihanAktif.denda)} valueClass="text-orange-500" />
                  )}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tagihan</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatRupiah(totalTagihan)}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-md overflow-hidden">
                <SectionHeader title="Panduan Transfer" />
                <div className="p-6 space-y-4">
                  {["Transfer sesuai nominal tagihan.", "Simpan bukti transfer dari aplikasi bank.", "Upload bukti pembayaran pada form.", "Tunggu verifikasi dari admin (1x24 jam)."].map((text, i) => (
                    <div key={text} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <p className="text-sm font-medium text-gray-600 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>

      {/* MODAL SUKSES */}
      <Modal open={modalSuccess} onClose={() => setModalSuccess(false)}>
        <div className="text-center pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            Pembayaran kamu sudah diproses. Admin akan memverifikasi dalam 1x24 jam.
          </p>
          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left">
            <ModalRow label="Nama" value={namaPenghuni} />
            <ModalRow label="Kamar" value={noKamar} />
            <ModalRow label="Jumlah" value={formatRupiah(totalTagihan)} />
          </div>
          <button
            type="button"
            onClick={() => navigate("/riwayat")}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all"
          >
            Lihat Riwayat
          </button>
        </div>
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
          <img src={getAvatarSrc(profileImg)} alt={nama} className="w-full h-full object-cover" />
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueClass = "text-gray-800" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400 font-semibold">{label}</span>
      <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
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
      <p className="text-gray-400 text-sm mb-6">Apakah kamu yakin ingin keluar?</p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
        <button type="button" onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Ya, Logout</button>
      </div>
    </Modal>
  );
}

function ModalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-blue-100 last:border-0">
      <span className="text-sm text-gray-400 font-semibold">{label}</span>
      <span className="text-sm font-bold text-gray-800 text-right">{value}</span>
    </div>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10 text-blue-600">
      <path d="M10 20h44v28H10V20Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M10 28h44M18 39h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9 text-green-500">
      <path d="m13 24 7 7 15-16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ModalAnimationStyle() {
  return (
    <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
  );
}
