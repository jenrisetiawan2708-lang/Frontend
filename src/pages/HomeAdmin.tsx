import { type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { getDashboardAdmin } from "../api/dashboard";
import { getDaftarPenghuni, tambahPenghuni, hapusPenghuni } from "../api/penghuni";
import { getDaftarKamar } from "../api/kamar";
import { getForum, kirimPesan } from "../api/forum";
import { getTagihan, generateTagihanBulanan, buatTagihan } from "../api/tagihan";
import { getPembayaranMenunggu, validasiPembayaran } from "../api/pembayaran";
import { kirimPengumuman } from "../api/pengumuman";

import heroImg from "../assets/logo-navbar.png";

interface ModalProps { open: boolean; onClose: () => void; children: ReactNode; }

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const getCurrentTime = () =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .format(new Date()).replace(".", ":");

function Avatar({ nama }: { nama: string }) {
  const initials = nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-11 h-11 rounded-2xl bg-blue-100 border border-blue-200 shrink-0 flex items-center justify-center text-sm font-bold text-blue-600">
      {initials}
    </div>
  );
}

type View = "dashboard" | "penghuni" | "tagihan" | "pembayaran" | "pengumuman" | "forum";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [modalLogout, setModalLogout] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [dashData, setDashData] = useState<any>(null);
  const [penghuniList, setPenghuniList] = useState<any[]>([]);
  const [kamarList, setKamarList] = useState<any[]>([]);
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [pembayaranMenunggu, setPembayaranMenunggu] = useState<any[]>([]);
  const [forumMessages, setForumMessages] = useState<any[]>([]);

  const [modalTambahPenghuni, setModalTambahPenghuni] = useState(false);
  const [modalTagihan, setModalTagihan] = useState(false);
  const [modalPengumuman, setModalPengumuman] = useState(false);
  const [modalValidasi, setModalValidasi] = useState<any>(null);

  const [formPenghuni, setFormPenghuni] = useState({ nama: "", email: "", username: "", password: "", id_kamar: "", tanggal_masuk: "" });
  const [formTagihan, setFormTagihan] = useState({ bulan: new Date().toISOString().slice(0, 7), mode: "semua" as "semua" | "manual", id_sewa: "", jumlah: "" });
  const [formPengumuman, setFormPengumuman] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDashboard = () => getDashboardAdmin().then((r) => { if (r.success) setDashData(r.data); });
  const fetchPenghuni = () => getDaftarPenghuni().then((r) => { if (r.success) setPenghuniList(r.data); });
  const fetchKamar = () => getDaftarKamar().then((r) => { if (r.success) setKamarList(r.data); });
  const fetchTagihan = () => getTagihan().then((r) => { if (r.success) setTagihanList(r.data); });
  const fetchPembayaran = () => getPembayaranMenunggu().then((r) => { if (r.success) setPembayaranMenunggu(r.data); });
  const fetchForum = () => getForum().then((r) => { if (r.success) setForumMessages(r.data); });

  useEffect(() => { fetchDashboard(); fetchKamar(); }, []);

  useEffect(() => {
    if (activeView === "penghuni") fetchPenghuni();
    if (activeView === "tagihan") { fetchTagihan(); fetchPenghuni(); }
    if (activeView === "pembayaran") fetchPembayaran();
    if (activeView === "forum") fetchForum();
  }, [activeView]);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;
    try {
      const res = await kirimPesan(trimmed);
      if (res.success) setForumMessages((prev) => [...prev, { id: res.data.id, sender: "Admin", role: "owner", isi_pesan: trimmed, tanggal_fmt: getCurrentTime() }]);
    } catch {}
    setMessageText("");
  };

  const handleTambahPenghuni = async () => {
    setErrorMsg(""); setSuccessMsg("");
    if (!formPenghuni.nama || !formPenghuni.email || !formPenghuni.password || !formPenghuni.id_kamar || !formPenghuni.tanggal_masuk) {
      setErrorMsg("Semua field wajib diisi!"); return;
    }
    setLoadingAction(true);
    try {
      await tambahPenghuni({
        nama: formPenghuni.nama,
        email: formPenghuni.email,
        username: formPenghuni.username || formPenghuni.email.split("@")[0],
        password: formPenghuni.password,
        id_kamar: Number(formPenghuni.id_kamar),
        tanggal_masuk: formPenghuni.tanggal_masuk,
      });
      setSuccessMsg("Penghuni berhasil ditambahkan!");
      setFormPenghuni({ nama: "", email: "", username: "", password: "", id_kamar: "", tanggal_masuk: "" });
      fetchPenghuni(); fetchDashboard(); fetchKamar();
      setTimeout(() => { setModalTambahPenghuni(false); setSuccessMsg(""); }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal menambahkan penghuni.");
    } finally { setLoadingAction(false); }
  };

  const handleHapusPenghuni = async (id: number, nama: string) => {
    if (!confirm(`Hapus penghuni ${nama}?`)) return;
    try {
      await hapusPenghuni(id);
      fetchPenghuni(); fetchDashboard(); fetchKamar();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus penghuni.");
    }
  };

  const handleGenerateTagihan = async () => {
    setErrorMsg(""); setSuccessMsg("");
    setLoadingAction(true);
    try {
      const bulanFull = formTagihan.bulan + "-01";
      if (formTagihan.mode === "semua") {
        const res = await generateTagihanBulanan(bulanFull);
        setSuccessMsg(res.message || "Tagihan berhasil digenerate!");
      } else {
        if (!formTagihan.id_sewa || !formTagihan.jumlah) { setErrorMsg("Pilih penghuni dan isi jumlah!"); setLoadingAction(false); return; }
        await buatTagihan({ id_sewa: Number(formTagihan.id_sewa), bulan: bulanFull, jumlah: Number(formTagihan.jumlah) });
        setSuccessMsg("Tagihan berhasil dibuat!");
      }
      fetchTagihan(); fetchDashboard();
      setTimeout(() => { setModalTagihan(false); setSuccessMsg(""); }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal membuat tagihan.");
    } finally { setLoadingAction(false); }
  };

  const handleValidasi = async (id: number, status: "Valid" | "Ditolak") => {
    try {
      await validasiPembayaran(id, status);
      setModalValidasi(null);
      fetchPembayaran(); fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal validasi.");
    }
  };

  const handleKirimPengumuman = async () => {
    setErrorMsg(""); setSuccessMsg("");
    if (!formPengumuman.trim()) { setErrorMsg("Pesan tidak boleh kosong!"); return; }
    setLoadingAction(true);
    try {
      const res = await kirimPengumuman(formPengumuman);
      setSuccessMsg(res.message || "Pengumuman berhasil dikirim!");
      setFormPengumuman("");
      setTimeout(() => { setModalPengumuman(false); setSuccessMsg(""); }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal kirim pengumuman.");
    } finally { setLoadingAction(false); }
  };

  const totalKamar = dashData?.kamar?.total ?? 0;
  const kamarTerisi = dashData?.kamar?.terisi ?? 0;
  const kamarKosong = dashData?.kamar?.kosong ?? 0;
  const totalPendapatan = dashData?.pendapatan_bulan_ini ?? 0;
  const menungguValidasi = dashData?.menunggu_validasi ?? 0;

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <button type="button" onClick={() => setActiveView("dashboard")} className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-14 object-contain" />
            <h1 className="text-3xl font-extrabold text-white tracking-wide">HOMIA</h1>
          </button>
          <div className="flex gap-5 text-white text-base items-center flex-wrap justify-end">
            <NavBtn active={activeView === "dashboard"} onClick={() => setActiveView("dashboard")}>Dashboard</NavBtn>
            <NavBtn active={activeView === "penghuni"} onClick={() => setActiveView("penghuni")}>Penghuni</NavBtn>
            <NavBtn active={activeView === "tagihan"} onClick={() => setActiveView("tagihan")}>Tagihan</NavBtn>
            <NavBtn active={activeView === "pembayaran"} onClick={() => setActiveView("pembayaran")}>
              Pembayaran {menungguValidasi > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{menungguValidasi}</span>}
            </NavBtn>
            <NavBtn active={activeView === "pengumuman"} onClick={() => setActiveView("pengumuman")}>Pengumuman</NavBtn>
            <NavBtn active={activeView === "forum"} onClick={() => setActiveView("forum")}>Forum</NavBtn>
            <button type="button" onClick={() => setModalLogout(true)} className="hover:underline transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">

        {activeView === "dashboard" && (
          <>
            <section>
              <p className="text-lg text-gray-500">Selamat datang,</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-0.5">Admin HOMIA</h1>
              <p className="text-base text-gray-400 mt-1">Pantau dan kelola semua data kost dari sini.</p>
            </section>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total Kamar" value={String(totalKamar)} desc="Semua kamar" tone="blue" />
              <MetricCard label="Kamar Terisi" value={String(kamarTerisi)} desc="Penghuni aktif" tone="green" />
              <MetricCard label="Kamar Kosong" value={String(kamarKosong)} desc="Siap ditempati" tone="orange" />
              <MetricCard label="Pendapatan" value={formatRupiah(totalPendapatan)} desc="Bulan ini" tone="blue" />
            </div>

            {menungguValidasi > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 text-xl">⏳</span>
                  <p className="font-bold text-yellow-800">Ada <span className="text-yellow-600">{menungguValidasi}</span> pembayaran menunggu validasi</p>
                </div>
                <button onClick={() => setActiveView("pembayaran")} className="text-xs font-semibold text-yellow-600 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full transition">
                  Validasi Sekarang →
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction icon="" label="Tambah Penghuni" onClick={() => { setActiveView("penghuni"); setModalTambahPenghuni(true); }} color="blue" />
              <QuickAction icon="" label="Buat Tagihan" onClick={() => { setActiveView("tagihan"); setModalTagihan(true); }} color="green" />
              <QuickAction icon="" label="Validasi Bayar" onClick={() => setActiveView("pembayaran")} color="orange" badge={menungguValidasi} />
              <QuickAction icon="" label="Kirim Pengumuman" onClick={() => { setActiveView("pengumuman"); setModalPengumuman(true); }} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              <PenghuniPreview onViewAll={() => setActiveView("penghuni")} />
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <SectionHeader title="Pendapatan Bulan Ini" />
                <div className="p-7">
                  <p className="text-4xl font-extrabold text-gray-900">{formatRupiah(totalPendapatan)}</p>
                  <p className="text-sm text-gray-400 mt-2">Dari {kamarTerisi} kamar aktif</p>
                  <button onClick={() => setActiveView("tagihan")} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all">
                    Lihat Semua Tagihan
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === "penghuni" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-lg text-gray-500">Kelola</p>
                <h1 className="text-4xl font-extrabold text-gray-900">Data Penghuni</h1>
              </div>
              <button onClick={() => { setErrorMsg(""); setSuccessMsg(""); setModalTambahPenghuni(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
                + Tambah Penghuni
              </button>
            </div>
            <section className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-3">
                {["Nama", "Kamar", "Email", "Status", "Aksi"].map((h, i) => (
                  <div key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-widest ${i === 0 ? "col-span-3" : i === 1 ? "col-span-2" : i === 2 ? "col-span-3" : i === 3 ? "col-span-2" : "col-span-2 text-right"}`}>{h}</div>
                ))}
              </div>
              <div className="divide-y divide-gray-100">
                {penghuniList.length === 0 && <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada data penghuni</div>}
                {penghuniList.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-blue-50/30 transition">
                    <div className="col-span-3 flex items-center gap-3"><Avatar nama={item.nama} /><p className="text-sm font-bold text-gray-900 truncate">{item.nama}</p></div>
                    <div className="col-span-2"><p className="text-base font-bold text-gray-900">{item.kamar?.nomor_kamar || "-"}</p></div>
                    <div className="col-span-3"><p className="text-sm text-gray-500 truncate">{item.email}</p></div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${item.kamar ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                        {item.kamar ? "Aktif" : "No Kamar"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button onClick={() => handleHapusPenghuni(item.id, item.nama)} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "tagihan" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-lg text-gray-500">Kelola</p>
                <h1 className="text-4xl font-extrabold text-gray-900">Tagihan</h1>
              </div>
              <button onClick={() => { setErrorMsg(""); setSuccessMsg(""); setModalTagihan(true); }} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
                + Buat Tagihan
              </button>
            </div>
            <section className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-100 px-6 py-3">
                {["Penghuni", "Kamar", "Bulan", "Total", "Status"].map((h, i) => (
                  <div key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-widest ${i === 0 ? "col-span-3" : i === 1 ? "col-span-2" : i === 2 ? "col-span-3" : i === 3 ? "col-span-2" : "col-span-2 text-right"}`}>{h}</div>
                ))}
              </div>
              <div className="divide-y divide-gray-100">
                {tagihanList.length === 0 && <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada tagihan</div>}
                {tagihanList.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-blue-50/30 transition">
                    <div className="col-span-3"><p className="text-sm font-bold text-gray-900 truncate">{item.penghuni?.nama || "-"}</p></div>
                    <div className="col-span-2"><p className="text-sm font-bold">{item.kamar?.nomor || "-"}</p></div>
                    <div className="col-span-3"><p className="text-sm text-gray-600">{item.bulan_label || item.bulan}</p></div>
                    <div className="col-span-2"><p className="text-sm font-bold">{item.total_format}</p></div>
                    <div className="col-span-2 flex justify-end">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.status_tagihan === "Lunas" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{item.status_tagihan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "pembayaran" && (
          <>
            <div>
              <p className="text-lg text-gray-500">Validasi</p>
              <h1 className="text-4xl font-extrabold text-gray-900">Pembayaran Masuk</h1>
              <p className="text-base text-gray-400 mt-1">Verifikasi bukti pembayaran dari penghuni.</p>
            </div>
            <section className="bg-white rounded-2xl shadow-md overflow-hidden">
              {pembayaranMenunggu.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <p className="text-3xl mb-3"></p>
                  <p className="font-semibold text-gray-600">Tidak ada pembayaran yang menunggu validasi</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pembayaranMenunggu.map((item: any) => (
                    <div key={item.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/20 transition">
                      <div className="flex items-center gap-4">
                        <Avatar nama={item.penghuni?.nama || "?"} />
                        <div>
                          <p className="font-bold text-gray-900">{item.penghuni?.nama || "-"}</p>
                          <p className="text-sm text-gray-400">Kamar {item.kamar?.nomor || "-"} · {item.tanggal_pembayaran}</p>
                          <p className="text-sm font-bold text-blue-600 mt-0.5">{item.jumlah_format}</p>
                        </div>
                      </div>
                      <button onClick={() => setModalValidasi(item)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-all">
                        Validasi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === "pengumuman" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-lg text-gray-500">Broadcast</p>
                <h1 className="text-4xl font-extrabold text-gray-900">Pengumuman</h1>
              </div>
              <button onClick={() => { setErrorMsg(""); setSuccessMsg(""); setModalPengumuman(true); }} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
                + Kirim Pengumuman
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-400">
              <p className="text-5xl mb-4"></p>
              <p className="font-semibold text-gray-600 text-lg">Kirim pengumuman ke semua penghuni sekaligus</p>
              <p className="text-sm mt-2">Pengumuman akan masuk ke notifikasi semua penghuni aktif</p>
              <button onClick={() => { setErrorMsg(""); setSuccessMsg(""); setModalPengumuman(true); }} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl active:scale-95 transition-all">
                Tulis Pengumuman
              </button>
            </div>
          </>
        )}

        {activeView === "forum" && (
          <>
            <div>
              <p className="text-lg text-gray-500">Komunikasi</p>
              <h1 className="text-4xl font-extrabold text-gray-900">Forum Penghuni</h1>
            </div>
            <ForumAdmin messages={forumMessages} messageText={messageText} onChangeMessage={setMessageText} onSend={handleSendMessage}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendMessage(); } }} />
          </>
        )}
      </main>

      <Modal open={modalTambahPenghuni} onClose={() => setModalTambahPenghuni(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Tambah Penghuni Baru</h2>
        {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl">{successMsg}</div>}
        {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">{errorMsg}</div>}
        <div className="space-y-3">
          <FormField label="Nama Lengkap" value={formPenghuni.nama} onChange={(v) => setFormPenghuni({ ...formPenghuni, nama: v })} placeholder="Nama penghuni" />
          <FormField label="Email" value={formPenghuni.email} onChange={(v) => setFormPenghuni({ ...formPenghuni, email: v })} placeholder="email@contoh.com" />
          <FormField label="Username (opsional)" value={formPenghuni.username} onChange={(v) => setFormPenghuni({ ...formPenghuni, username: v })} placeholder="Kosongkan = otomatis" />
          <FormField label="Password" value={formPenghuni.password} onChange={(v) => setFormPenghuni({ ...formPenghuni, password: v })} placeholder="Min 8 karakter" type="password" />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Pilih Kamar</label>
            <select value={formPenghuni.id_kamar} onChange={(e) => setFormPenghuni({ ...formPenghuni, id_kamar: e.target.value })}
              className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Pilih Kamar Kosong --</option>
              {kamarList.filter((k: any) => k.status_kamar === "kosong").map((k: any) => (
                <option key={k.id} value={k.id}>Kamar {k.nomor_kamar} — {k.harga_format}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Masuk</label>
            <input
              type="text"
              value={formPenghuni.tanggal_masuk}
              onChange={(e) => setFormPenghuni({ ...formPenghuni, tanggal_masuk: e.target.value })}
              placeholder="2026-05-27"
              className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD · contoh: 2026-05-27</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModalTambahPenghuni(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
          <button onClick={handleTambahPenghuni} disabled={loadingAction} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all disabled:opacity-60">
            {loadingAction ? "Menyimpan..." : "Tambah Penghuni"}
          </button>
        </div>
      </Modal>

      <Modal open={modalTagihan} onClose={() => setModalTagihan(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Buat Tagihan</h2>
        {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl">{successMsg}</div>}
        {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">{errorMsg}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mode</label>
            <div className="flex gap-3">
              <button onClick={() => setFormTagihan({ ...formTagihan, mode: "semua" })} className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition ${formTagihan.mode === "semua" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                 Semua Penghuni
              </button>
              <button onClick={() => setFormTagihan({ ...formTagihan, mode: "manual" })} className={`flex-1 py-2.5 text-sm font-bold rounded-xl border transition ${formTagihan.mode === "manual" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"}`}>
                 Manual
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Bulan</label>
            <input type="month" value={formTagihan.bulan} onChange={(e) => setFormTagihan({ ...formTagihan, bulan: e.target.value })}
              className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {formTagihan.mode === "manual" && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Penghuni</label>
                <select value={formTagihan.id_sewa} onChange={(e) => setFormTagihan({ ...formTagihan, id_sewa: e.target.value })}
                  className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">-- Pilih Penghuni --</option>
                  {penghuniList.filter((p: any) => p.kamar).map((p: any) => (
                    <option key={p.id} value={p.kamar?.id_sewa}>{p.nama} — Kamar {p.kamar?.nomor_kamar}</option>
                  ))}
                </select>
              </div>
              <FormField label="Jumlah (Rp)" value={formTagihan.jumlah} onChange={(v) => setFormTagihan({ ...formTagihan, jumlah: v })} placeholder="1500000" type="number" />
            </>
          )}
          {formTagihan.mode === "semua" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-600 font-semibold">
               Tagihan dibuat otomatis sesuai harga kamar masing-masing penghuni aktif.
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModalTagihan(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
          <button onClick={handleGenerateTagihan} disabled={loadingAction} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all disabled:opacity-60">
            {loadingAction ? "Memproses..." : "Buat Tagihan"}
          </button>
        </div>
      </Modal>

      <Modal open={!!modalValidasi} onClose={() => setModalValidasi(null)}>
        {modalValidasi && (
          <>
            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Validasi Pembayaran</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5">
              <InfoRow label="Penghuni" value={modalValidasi.penghuni?.nama || "-"} />
              <InfoRow label="Kamar" value={`Kamar ${modalValidasi.kamar?.nomor || "-"}`} />
              <InfoRow label="Jumlah" value={modalValidasi.jumlah_format} />
              <InfoRow label="Tanggal" value={modalValidasi.tanggal_pembayaran} />
            </div>
            {modalValidasi.bukti && !modalValidasi.bukti.startsWith("midtrans:") && (
              <a href={modalValidasi.bukti} target="_blank" rel="noreferrer" className="block w-full text-center text-sm font-bold text-blue-500 hover:underline mb-4">
                 Lihat Bukti Transfer
              </a>
            )}
            <div className="flex gap-3">
              <button onClick={() => handleValidasi(modalValidasi.id, "Ditolak")} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl active:scale-95 transition-all border border-red-200">❌ Tolak</button>
              <button onClick={() => handleValidasi(modalValidasi.id, "Valid")} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all">✅ Validasi</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={modalPengumuman} onClose={() => setModalPengumuman(false)}>
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Kirim Pengumuman</h2>
        {successMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl">{successMsg}</div>}
        {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">{errorMsg}</div>}
        <p className="text-sm text-gray-500 mb-3">Pesan akan dikirim ke semua penghuni aktif.</p>
        <textarea value={formPengumuman} onChange={(e) => setFormPengumuman(e.target.value)} placeholder="Tulis isi pengumuman..." rows={4}
          className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setModalPengumuman(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
          <button onClick={handleKirimPengumuman} disabled={loadingAction} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all disabled:opacity-60">
            {loadingAction ? "Mengirim..." : "Kirim ke Semua"}
          </button>
        </div>
      </Modal>

      <Modal open={modalLogout} onClose={() => setModalLogout(false)}>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Logout?</h2>
        <p className="text-gray-500 text-sm mb-6">Apakah kamu yakin ingin keluar dari dashboard admin?</p>
        <div className="flex gap-3">
          <button onClick={() => setModalLogout(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
          <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all">Ya, Logout</button>
        </div>
      </Modal>

      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`transition hover:underline flex items-center gap-1 ${active ? "underline font-bold" : ""}`}>{children}</button>;
}

function MetricCard({ label, value, desc, tone }: { label: string; value: string; desc: string; tone: "blue" | "green" | "orange" }) {
  const t = { blue: { card: "bg-blue-50 border-blue-100", label: "text-blue-500", val: "text-blue-700" }, green: { card: "bg-green-50 border-green-100", label: "text-green-600", val: "text-green-700" }, orange: { card: "bg-orange-50 border-orange-100", label: "text-orange-500", val: "text-orange-600" } }[tone];
  return (
    <div className={`rounded-2xl border p-5 hover:-translate-y-1 hover:shadow-lg transition-all ${t.card}`}>
      <p className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>{label}</p>
      <p className={`text-2xl font-extrabold mt-2 ${t.val}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color, badge }: { icon: string; label: string; onClick: () => void; color: string; badge?: number }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700", green: "bg-green-50 hover:bg-green-100 border-green-100 text-green-700", orange: "bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-700", purple: "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700" };
  return (
    <button onClick={onClick} className={`rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 relative ${colors[color]}`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-bold mt-2">{label}</p>
      {badge && badge > 0 ? <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span> : null}
    </button>
  );
}

function PenghuniPreview({ onViewAll }: { onViewAll: () => void }) {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { getDaftarPenghuni().then((r) => { if (r.success) setData(r.data.slice(0, 5)); }); }, []);
  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="px-7 py-5 flex items-center justify-between border-b border-gray-100">
        <div><h2 className="text-xl font-extrabold text-gray-900">Penghuni Aktif</h2><p className="text-sm text-gray-400 mt-0.5">5 terbaru</p></div>
        <button onClick={onViewAll} className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua →</button>
      </div>
      <div className="divide-y divide-gray-100">
        {data.length === 0 && <div className="px-6 py-8 text-center text-gray-400 text-sm">Belum ada penghuni</div>}
        {data.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/30 transition">
            <Avatar nama={item.nama} />
            <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{item.nama}</p><p className="text-xs text-gray-400">{item.email}</p></div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.kamar ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
              {item.kamar ? `Kamar ${item.kamar.nomor_kamar}` : "No Kamar"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForumAdmin({ messages, messageText, onChangeMessage, onSend, onKeyDown }: { messages: any[]; messageText: string; onChangeMessage: (v: string) => void; onSend: () => void; onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  return (
    <section className="bg-white rounded-2xl shadow-md overflow-hidden h-[600px] flex flex-col">
      <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-extrabold text-gray-900">Forum Komunikasi</h2>
        <span className="rounded-full bg-green-50 text-green-600 border border-green-100 px-4 py-2 text-sm font-bold">Admin Online</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f7fb] px-6 py-5 space-y-4">
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
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-gray-100 bg-white p-4 shrink-0">
        <div className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3">
          <input value={messageText} onChange={(e) => onChangeMessage(e.target.value)} onKeyDown={onKeyDown} placeholder="Tulis pesan sebagai admin..."
            className="flex-1 min-w-0 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          <button onClick={onSend} disabled={!messageText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm">Kirim</button>
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

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md relative shadow-2xl animate-[modalIn_180ms_ease-out] max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-500 flex items-center justify-center transition">✕</button>
        {children}
      </div>
    </div>
  );
}
