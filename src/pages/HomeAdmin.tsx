import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { getDashboardAdmin } from "../api/dashboard";
import { getDaftarPenghuni, tambahPenghuni, hapusPenghuni, updatePenghuni } from "../api/penghuni";
import { getDaftarKamar } from "../api/kamar";
import { generateTagihanBulanan } from "../api/tagihan";
import { validasiPembayaran, getPembayaranMenunggu } from "../api/pembayaran";
import { kirimPengumuman } from "../api/pengumuman";
import { getForum, kirimPesan } from "../api/forum";

import heroImg from "../assets/logo-navbar.png";

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(".", ":");
}

function Avatar({ nama }: { nama: string }) {
  const initials = nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-sm font-bold text-white">
      {initials}
    </div>
  );
}

type ActiveView = "dashboard" | "penghuni" | "tagihan" | "pembayaran" | "pengumuman" | "forum";

export default function HomeAdmin() {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [modalLogout, setModalLogout] = useState(false);

  // Dashboard data
  const [dashData, setDashData] = useState<any>(null);
  const [penghuniList, setPenghuniList] = useState<any[]>([]);

  useEffect(() => {
    getDashboardAdmin().then((res) => { if (res.success) setDashData(res.data); });
  }, []);

  const refreshPenghuni = () => {
    getDaftarPenghuni().then((res) => { if (res.success) setPenghuniList(res.data); });
  };

  useEffect(() => {
    if (activeView === "penghuni") refreshPenghuni();
  }, [activeView]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const totalKamar = dashData?.kamar?.total ?? 0;
  const kamarTerisi = dashData?.kamar?.terisi ?? 0;
  const kamarKosong = dashData?.kamar?.kosong ?? 0;
  const totalPendapatan = dashData?.pendapatan_bulan_ini ?? 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav style={{ background: "linear-gradient(to right, #1d4ed8, #60a5fa)" }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button type="button" onClick={() => setActiveView("dashboard")} className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-10 object-contain" />
            <span className="text-2xl font-extrabold text-white tracking-wide">HOMIA</span>
          </button>

          <div className="flex gap-6 text-white text-base items-center">
            {(["dashboard","penghuni","tagihan","pembayaran","pengumuman","forum"] as ActiveView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveView(v)}
                className={`capitalize transition hover:underline ${activeView === v ? "underline font-bold" : ""}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
            <button type="button" onClick={() => setModalLogout(true)} className="hover:underline transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeView === "dashboard" && (
          <DashboardView
            totalKamar={totalKamar}
            kamarTerisi={kamarTerisi}
            kamarKosong={kamarKosong}
            totalPendapatan={totalPendapatan}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "penghuni" && (
          <PenghuniView data={penghuniList} onRefresh={refreshPenghuni} />
        )}
        {activeView === "tagihan" && <TagihanView />}
        {activeView === "pembayaran" && <PembayaranView />}
        {activeView === "pengumuman" && <PengumumanView />}
        {activeView === "forum" && <ForumView />}
      </main>

      {/* MODAL LOGOUT */}
      <Modal open={modalLogout} onClose={() => setModalLogout(false)}>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Logout?</h2>
        <p className="text-gray-500 text-sm mb-6">Apakah kamu yakin ingin keluar dari dashboard admin?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setModalLogout(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">Batal</button>
          <button type="button" onClick={handleLogout} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition">Ya, Logout</button>
        </div>
      </Modal>

      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}

// ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
function DashboardView({ totalKamar, kamarTerisi, kamarKosong, totalPendapatan, onNavigate }: {
  totalKamar: number; kamarTerisi: number; kamarKosong: number; totalPendapatan: number;
  onNavigate: (v: ActiveView) => void;
}) {
  const [penghuni, setPenghuni] = useState<any[]>([]);
  useEffect(() => {
    getDaftarPenghuni().then((res) => { if (res.success) setPenghuni(res.data.slice(0, 5)); });
  }, []);

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="TOTAL KAMAR" value={String(totalKamar)} sub="Semua kamar" color="blue" />
        <StatCard label="KAMAR TERISI" value={String(kamarTerisi)} sub="Penghuni aktif" color="green" />
        <StatCard label="KAMAR KOSONG" value={String(kamarKosong)} sub="Siap ditempati" color="red" />
        <StatCard label="PENDAPATAN" value={formatRupiah(totalPendapatan)} sub="Bulan ini" color="blue" />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickBtn label="Tambah Penghuni" color="blue-outline" onClick={() => onNavigate("penghuni")} />
        <QuickBtn label="Buat Tagihan" color="green-outline" onClick={() => onNavigate("tagihan")} />
        <QuickBtn label="Validasi Bayar" color="red-outline" onClick={() => onNavigate("pembayaran")} />
        <QuickBtn label="Kirim Pengumuman" color="blue-outline" onClick={() => onNavigate("pengumuman")} />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Penghuni Aktif */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <p className="font-extrabold text-gray-900 text-lg">PENGHUNI AKTIF</p>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">5 terbaru</p>
            </div>
            <button type="button" onClick={() => onNavigate("penghuni")} className="text-sm text-blue-600 font-semibold hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y divide-gray-100">
            {penghuni.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada penghuni</p>}
            {penghuni.map((p: any) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <Avatar nama={p.nama} />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.nama}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </div>
                </div>
                <p className="font-bold text-green-600 text-sm">Kamar {p.kamar?.nomor_kamar || "-"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pendapatan */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <p className="font-bold text-gray-700 text-sm uppercase tracking-wide">Pendapatan Bulan Ini</p>
          </div>
          <div className="px-6 py-6">
            <p className="text-4xl font-extrabold text-gray-900">{formatRupiah(totalPendapatan)}</p>
            <p className="text-sm text-gray-400 mt-2">Dari {String(totalPendapatan > 0 ? "kamar aktif" : "0 kamar aktif")}</p>
            <button
              type="button"
              onClick={() => onNavigate("tagihan")}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Lihat Semua Tagihan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: "blue" | "green" | "red" }) {
  const cls = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-600",
  }[color];
  const labelCls = { blue: "text-blue-500", green: "text-green-600", red: "text-red-500" }[color];
  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${labelCls}`}>{label}</p>
      <p className="text-3xl font-extrabold mt-2">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const cls = color === "green-outline"
    ? "border-green-400 text-green-600 hover:bg-green-50"
    : color === "red-outline"
    ? "border-red-400 text-red-500 hover:bg-red-50"
    : "border-blue-400 text-blue-600 hover:bg-blue-50";
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition ${cls}`}>
      {label}
    </button>
  );
}

// ─── PENGHUNI VIEW ────────────────────────────────────────────────────────────
function PenghuniView({ data, onRefresh }: { data: any[]; onRefresh: () => void }) {
  const [modalTambah, setModalTambah] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [hapusTarget, setHapusTarget] = useState<any | null>(null);
  const [loadingHapus, setLoadingHapus] = useState(false);

  const handleHapus = async () => {
    if (!hapusTarget) return;
    setLoadingHapus(true);
    try { await hapusPenghuni(hapusTarget.id); onRefresh(); } catch {}
    setLoadingHapus(false);
    setHapusTarget(null);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Kelola</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Data Penghuni</h1>
        </div>
        <button type="button" onClick={() => setModalTambah(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
          + Tambah Penghuni
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-3">
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Nama</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Kamar</div>
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</div>
        </div>
        <div className="divide-y divide-gray-100">
          {data.length === 0 && <p className="px-6 py-10 text-center text-gray-400 text-sm">Belum ada data penghuni</p>}
          {data.map((item: any) => (
            <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-blue-50/30 transition">
              <div className="col-span-3 flex items-center gap-3">
                <Avatar nama={item.nama} />
                <p className="text-sm font-bold text-gray-900 truncate">{item.nama}</p>
              </div>
              <div className="col-span-2">
                <p className="font-bold text-gray-900">{item.kamar?.nomor_kamar || <span className="text-gray-400 font-normal text-sm italic">-</span>}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-gray-500 truncate">{item.email}</p>
              </div>
              <div className="col-span-2">
                <StatusBadge status={item.status} hasKamar={!!item.kamar} />
              </div>
              <div className="col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditTarget(item)} className="text-blue-600 hover:underline text-sm font-bold">Edit</button>
                <button type="button" onClick={() => setHapusTarget(item)} className="text-red-500 hover:underline text-sm font-bold">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah */}
      {modalTambah && <ModalTambahPenghuni onClose={() => setModalTambah(false)} onSaved={() => { setModalTambah(false); onRefresh(); }} />}

      {/* Modal Edit */}
      {editTarget && <ModalEditPenghuni penghuni={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); onRefresh(); }} />}

      {/* Modal Hapus */}
      <Modal open={!!hapusTarget} onClose={() => setHapusTarget(null)}>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Hapus Penghuni?</h2>
        <p className="text-gray-500 text-sm mb-6">Yakin ingin menghapus <span className="font-bold text-gray-800">{hapusTarget?.nama}</span>?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setHapusTarget(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">Batal</button>
          <button type="button" onClick={handleHapus} disabled={loadingHapus} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
            {loadingHapus ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadge({ status, hasKamar }: { status?: string; hasKamar: boolean }) {
  if (!hasKamar) return <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold bg-gray-50 text-gray-400 border-gray-200">No Kamar</span>;
  const isAktif = status !== "non-aktif";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${isAktif ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
      {isAktif ? "Aktif" : "Non-Aktif"}
    </span>
  );
}

// ─── Modal Tambah Penghuni ────────────────────────────────────────────────────
function ModalTambahPenghuni({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [kamarList, setKamarList] = useState<any[]>([]);
  const [form, setForm] = useState({ nama: "", email: "", username: "", password: "", id_kamar: "", tanggal_masuk: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getDaftarKamar("kosong").then((res) => { if (res.success) setKamarList(res.data); });
  }, []);

  const handleSubmit = async () => {
    if (!form.nama || !form.email || !form.password || !form.id_kamar) { setErrorMsg("Nama, email, password, dan kamar wajib diisi."); return; }
    setLoading(true); setErrorMsg("");
    try {
      const res = await tambahPenghuni({ ...form, id_kamar: Number(form.id_kamar) });
      if (res.success) { onSaved(); } else { setErrorMsg(res.message || "Gagal menambah penghuni."); }
    } catch { setErrorMsg("Terjadi kesalahan."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center">✕</button>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Tambah Penghuni Baru</h2>
        <div className="space-y-3">
          {[
            { label: "Nama Lengkap", key: "nama", placeholder: "Nama Penghuni" },
            { label: "email", key: "email", placeholder: "email@contoh.com" },
            { label: "Username (opsional)", key: "username", placeholder: "" },
            { label: "Password", key: "password", placeholder: "••••••", type: "password" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <input
                type={type || "text"}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pilih Kamar</label>
            <select value={form.id_kamar} onChange={(e) => setForm((f) => ({ ...f, id_kamar: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500">
              <option value="">--Pilih kamar kosong--</option>
              {kamarList.map((k: any) => <option key={k.id} value={k.id}>{k.nomor_kamar}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
            <input type="text" value={form.tanggal_masuk} onChange={(e) => setForm((f) => ({ ...f, tanggal_masuk: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
          </div>
        </div>
        {errorMsg && <div className="mt-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{errorMsg}</div>}
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
            {loading ? "Menyimpan..." : "Tambah Penghuni"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Edit Penghuni ──────────────────────────────────────────────────────
function ModalEditPenghuni({ penghuni, onClose, onSaved }: { penghuni: any; onClose: () => void; onSaved: () => void }) {
  const [kamarList, setKamarList] = useState<any[]>([]);
  const [selectedKamar, setSelectedKamar] = useState<string>(penghuni.kamar?.id ? String(penghuni.kamar.id) : "");
  const [status, setStatus] = useState<"aktif" | "non-aktif">(penghuni.status === "non-aktif" ? "non-aktif" : "aktif");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Ambil semua kamar, filter di frontend: kosong + kamar penghuni saat ini
    getDaftarKamar().then((res) => {
      if (res.success) {
        const filtered = res.data.filter(
          (k: any) => k.status_kamar === "kosong" || k.id === penghuni.kamar?.id
        );
        setKamarList(filtered);
      }
    });
  }, [penghuni.kamar?.id]);

  const handleSave = async () => {
    setLoading(true); setErrorMsg("");
    try {
      const payload: Record<string, unknown> = { status };
      if (selectedKamar) payload.id_kamar = Number(selectedKamar);
      const res = await updatePenghuni(penghuni.id, payload);
      if (res.success) { onSaved(); } else { setErrorMsg(res.message || "Gagal menyimpan."); }
    } catch { setErrorMsg("Terjadi kesalahan."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center">✕</button>
        <div className="flex items-center gap-3 mb-6">
          <Avatar nama={penghuni.nama} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Penghuni</h2>
            <p className="text-sm text-gray-400">{penghuni.email}</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nomor Kamar</label>
          <select value={selectedKamar} onChange={(e) => setSelectedKamar(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500">
            <option value="">— Pilih Kamar —</option>
            {kamarList.map((k: any) => (
              <option key={k.id} value={String(k.id)}>{k.nomor_kamar}{k.id === penghuni.kamar?.id ? " (saat ini)" : " (kosong)"}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Status Penghuni</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setStatus("aktif")} className={`py-3 rounded-xl border-2 text-sm font-bold transition ${status === "aktif" ? "border-green-500 bg-green-50 text-green-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}>✓ Aktif</button>
            <button type="button" onClick={() => setStatus("non-aktif")} className={`py-3 rounded-xl border-2 text-sm font-bold transition ${status === "non-aktif" ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 bg-gray-50 text-gray-400"}`}>✗ Non-Aktif</button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{status === "aktif" ? "Aktif — sudah membayar tagihan." : "Non-Aktif — belum membayar tagihan."}</p>
        </div>
        {errorMsg && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{errorMsg}</div>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">Batal</button>
          <button type="button" onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">{loading ? "Menyimpan..." : "Simpan Perubahan"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TAGIHAN VIEW ─────────────────────────────────────────────────────────────
function TagihanView() {
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTagihan = () => {
    setLoadingList(true);
    import("../api/tagihan").then(({ getTagihan }) => {
      getTagihan().then((res: any) => {
        if (res.success) setTagihanList(res.data);
      }).finally(() => setLoadingList(false));
    }).catch(() => setLoadingList(false));
  };

  useEffect(() => { fetchTagihan(); }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Kelola</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Tagihan</h1>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm">
          + Buat Tagihan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-3">
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Penghuni</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Kamar</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Bulan</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</div>
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</div>
        </div>
        <div className="divide-y divide-gray-100">
          {loadingList && <p className="px-6 py-8 text-center text-gray-400 text-sm">Memuat...</p>}
          {!loadingList && tagihanList.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada tagihan.</p>}
          {tagihanList.map((t: any) => (
            <div key={t.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition">
              <div className="col-span-3"><p className="text-sm font-bold text-gray-900">{t.penghuni?.nama || "-"}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-700">{t.kamar?.nomor || "-"}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-500">{t.bulan_label || t.bulan}</p></div>
              <div className="col-span-2"><p className="text-sm font-bold text-gray-900">{t.total_format || "-"}</p></div>
              <div className="col-span-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${t.status_tagihan === "Lunas" ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                  {t.status_tagihan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && <ModalBuatTagihan onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); fetchTagihan(); }} />}
    </div>
  );
}

function ModalBuatTagihan({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<"semua" | "manual">("semua");
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7));
  const [penghuniList, setPenghuniList] = useState<any[]>([]);
  const [selectedPenghuni, setSelectedPenghuni] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (mode === "manual") {
      getDaftarPenghuni().then((res) => { if (res.success) setPenghuniList(res.data); });
    }
  }, [mode]);

  const handleSubmit = async () => {
    setLoading(true); setMsg("");
    try {
      if (mode === "semua") {
        const res = await generateTagihanBulanan(bulan + "-01");
        if (res.success) { setMsgType("success"); setMsg("Tagihan berhasil dibuat untuk semua penghuni!"); setTimeout(onSaved, 1200); }
        else { setMsgType("error"); setMsg(res.message || "Gagal membuat tagihan."); }
      } else {
        if (!selectedPenghuni || !jumlah) { setMsgType("error"); setMsg("Penghuni dan jumlah wajib diisi."); setLoading(false); return; }
        const penghuni = penghuniList.find((p: any) => String(p.id) === selectedPenghuni);
        if (!penghuni?.kamar?.id_sewa) { setMsgType("error"); setMsg("Penghuni belum punya kamar aktif."); setLoading(false); return; }
        const { buatTagihan } = await import("../api/tagihan");
        const res = await buatTagihan({ id_sewa: penghuni.kamar.id_sewa, bulan: bulan + "-01", jumlah: Number(jumlah) });
        if (res.success) { setMsgType("success"); setMsg("Tagihan berhasil dibuat!"); setTimeout(onSaved, 1200); }
        else { setMsgType("error"); setMsg(res.message || "Gagal membuat tagihan."); }
      }
    } catch { setMsgType("error"); setMsg("Terjadi kesalahan."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center">✕</button>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Buat Tagihan</h2>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2">Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode("semua")} className={`py-2.5 rounded-xl border-2 text-sm font-bold transition ${mode === "semua" ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700"}`}>Semua Penghuni</button>
            <button type="button" onClick={() => setMode("manual")} className={`py-2.5 rounded-xl border-2 text-sm font-bold transition ${mode === "manual" ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700"}`}>Manual</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2">Bulan</label>
          <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
        </div>

        {mode === "semua" && (
          <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 font-semibold">
            Tagihan dibuat otomatis sesuai harga kamar masing masing penghuni aktif
          </div>
        )}

        {mode === "manual" && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Penghuni</label>
              <select value={selectedPenghuni} onChange={(e) => setSelectedPenghuni(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500">
                <option value="">-- Pilih Penghuni --</option>
                {penghuniList.filter((p: any) => p.kamar).map((p: any) => (
                  <option key={p.id} value={String(p.id)}>{p.nama} - {p.kamar?.nomor_kamar}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Jumlah (Rp)</label>
              <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
            </div>
          </>
        )}

        {msg && <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${msgType === "success" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{msg}</div>}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition">Batal</button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">{loading ? "Memproses..." : "Buat Tagihan"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── PEMBAYARAN VIEW ──────────────────────────────────────────────────────────
function PembayaranView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    getPembayaranMenunggu().then((res) => { if (res.success) setList(res.data); }).finally(() => setLoading(false));
  }, []);

  const handleValidasi = async (id: number, status: "Valid" | "Ditolak") => {
    try {
      const res = await validasiPembayaran(id, status);
      if (res.success) {
        setList((prev) => prev.filter((p) => p.id !== id));
        setActionMsg(`Pembayaran berhasil di-${status === "Valid" ? "validasi" : "tolak"}.`);
      }
    } catch {}
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-gray-500">Kelola</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Validasi Pembayaran</h1>
      </div>
      {actionMsg && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 font-medium">{actionMsg}</div>}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-3">
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Penghuni</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Kamar</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Jumlah</div>
          <div className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Tanggal</div>
          <div className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</div>
        </div>
        <div className="divide-y divide-gray-100">
          {loading && <p className="px-6 py-8 text-center text-gray-400 text-sm">Memuat...</p>}
          {!loading && list.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada pembayaran yang menunggu validasi.</p>}
          {list.map((item: any) => (
            <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition">
              <div className="col-span-3"><p className="font-bold text-gray-900 text-sm">{item.penghuni?.nama || "-"}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-700">{item.kamar?.nomor_kamar || "-"}</p></div>
              <div className="col-span-2"><p className="text-sm font-bold text-gray-900">{formatRupiah(item.jumlah_bayar)}</p></div>
              <div className="col-span-2"><p className="text-sm text-gray-500">{item.tanggal_pembayaran?.slice(0, 10) || "-"}</p></div>
              <div className="col-span-3 flex justify-end gap-2">
                <button type="button" onClick={() => handleValidasi(item.id, "Valid")} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition">Valid</button>
                <button type="button" onClick={() => handleValidasi(item.id, "Ditolak")} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition">Tolak</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PENGUMUMAN VIEW ──────────────────────────────────────────────────────────
function PengumumanView() {
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleKirim = async () => {
    if (!pesan.trim()) return;
    setLoading(true); setMsg("");
    try {
      const res = await kirimPengumuman(pesan.trim());
      if (res.success) { setPesan(""); setMsg("Pengumuman berhasil dikirim!"); }
      else { setMsg(res.message || "Gagal mengirim."); }
    } catch { setMsg("Terjadi kesalahan."); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-sm text-gray-500">Broadcast</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Pengumuman</h1>
        </div>
        <button type="button" onClick={handleKirim} disabled={loading || !pesan.trim()} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm disabled:opacity-60">
          + Kirim Pengumuman
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow p-8">
        <p className="font-bold text-gray-900 text-lg mb-1">Kirim pengumuman ke semua penghuni sekaligus</p>
        <p className="text-sm text-gray-400 mb-5">Pengumuman akan masuk ke notifikasi semua penghuni aktif</p>
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          placeholder="Tulis isi pengumuman di sini..."
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
        />
        {msg && <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-medium ${msg.includes("berhasil") ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>{msg}</div>}
        <button type="button" onClick={handleKirim} disabled={loading || !pesan.trim()} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl transition disabled:opacity-60">
          {loading ? "Mengirim..." : "Tulis Pengumuman"}
        </button>
      </div>
    </div>
  );
}

// ─── FORUM VIEW ───────────────────────────────────────────────────────────────
function ForumView() {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    getForum().then((res) => { if (res.success) setMessages(res.data); });
  }, []);

  const handleSend = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    try {
      const res = await kirimPesan(trimmed);
      if (res.success) {
        setMessages((prev) => [...prev, { id: res.data.id, sender: "Admin", role: "owner", isi_pesan: trimmed, tanggal_fmt: getCurrentTime() }]);
      }
    } catch {}
    setMessageText("");
  };

  return (
    <div>
      <div className="mb-5">
        <p className="text-sm text-gray-500">Komunikasi</p>
        <h1 className="text-3xl font-extrabold text-gray-900">Forum Penghuni</h1>
      </div>
      <section className="bg-white rounded-2xl shadow overflow-hidden h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-bold text-gray-900">Forum Komunikasi</p>
          <span className="rounded-full bg-green-50 text-green-600 border border-green-100 px-3 py-1 text-xs font-bold">Admin Online</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f7fb] px-6 py-5 space-y-4">
          <div className="mx-auto w-fit rounded-full bg-white border border-gray-100 px-4 py-1.5 text-xs font-bold text-gray-400">Forum Penghuni</div>
          {messages.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.role === "owner" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[76%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === "owner" ? "bg-blue-600 text-white rounded-br-md" : "bg-white text-gray-900 border border-gray-100 rounded-bl-md"}`}>
                {msg.role !== "owner" && <p className="text-xs font-bold text-blue-600 mb-1">{msg.sender}</p>}
                {msg.role === "owner" && <p className="text-xs font-bold text-white/70 mb-1">Admin</p>}
                <p className="text-sm leading-relaxed">{msg.isi_pesan}</p>
                <div className={`mt-1 flex justify-end text-[11px] ${msg.role === "owner" ? "text-white/70" : "text-gray-400"}`}>{msg.tanggal_fmt}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3">
            <input value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }} placeholder="Tulis pesan sebagai admin..." className="flex-1 min-w-0 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            <button type="button" onClick={handleSend} disabled={!messageText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50 text-sm">Kirim</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm relative shadow-2xl animate-[modalIn_180ms_ease-out]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center">✕</button>
        {children}
      </div>
    </div>
  );
}
