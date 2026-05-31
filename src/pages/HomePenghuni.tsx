import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getCurrentUser } from "../api/auth";
import { getDashboardPenghuni } from "../api/dashboard";
import { getPengumuman } from "../api/pengumuman";
import { updatePenghuni } from "../api/penghuni";

// ASSETS
import heroImg from "../assets/logo-navbar.png";
import profileImg from "../assets/profile.jpg";
import estimasiTagihan from "../assets/estimasi-tagihan.png";
import pembayaran from "../assets/pembayaran.png";
import tagihan from "../assets/tagihan.png";
import riwayat from "../assets/riwayat.png";
import pengumuman from "../assets/pengumuman.png";
import telepon from "../assets/telepon.png";

export default function HomePenghuni() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modalLogout, setModalLogout] = useState(false);
  const [modalProfile, setModalProfile] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);

  // Profile state
  const currentUser = getCurrentUser();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    localStorage.getItem("homia_avatar") || profileImg
  );
  const [formProfile, setFormProfile] = useState({
    nama: "",
    email: "",
    username: "",
    no_hp: localStorage.getItem("homia_no_hp") || "",
    alamat_asal: localStorage.getItem("homia_alamat") || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    getDashboardPenghuni()
      .then((res) => {
        if (res.success) {
          setDashData(res.data);
          setFormProfile((prev) => ({
            ...prev,
            nama: res.data.nama || "",
            email: currentUser?.email || "",
            username: currentUser?.username || "",
          }));
        }
      })
      .catch(() => {});

    getPengumuman()
      .then((res) => { if (res.success) setPengumumanList(res.data.slice(0, 2)); })
      .catch(() => {});
  }, []);

  const namaPenghuni = dashData?.nama || currentUser?.nama || "Penghuni";
  const nomorKamar = dashData?.sewa?.nomor_kamar || "-";
  const hargaKamar = dashData?.sewa?.harga_format || "Rp 0";
  const tagihanAktif = dashData?.tagihan_aktif;

  const handleLogout = async () => { await logout(); navigate("/login"); };

  // Ganti foto profile (simpan lokal sebagai base64)
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      localStorage.setItem("homia_avatar", base64);
    };
    reader.readAsDataURL(file);
  };

  // Simpan profile
  const handleSaveProfile = async () => {
    setProfileError(""); setProfileSuccess("");
    setSavingProfile(true);
    try {
      // Simpan no_hp dan alamat di localStorage (backend belum punya kolom ini)
      localStorage.setItem("homia_no_hp", formProfile.no_hp);
      localStorage.setItem("homia_alamat", formProfile.alamat_asal);

      // Update nama & username ke backend
      if (currentUser?.id) {
        await updatePenghuni(currentUser.id, {
          nama: formProfile.nama,
          username: formProfile.username,
        });
      }

      setProfileSuccess("Profil berhasil disimpan!");
      setTimeout(() => { setProfileSuccess(""); setModalProfile(false); }, 1500);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar: foto atau inisial
  const initials = namaPenghuni.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#e9eaec]">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/dashboard-penghuni" className="flex items-center gap-3">
            <img src={heroImg} alt="HOMIA" className="w-14" />
            <h1 className="text-3xl font-extrabold text-white tracking-wide">HOMIA</h1>
          </Link>
          <div className="flex gap-8 text-white text-xl items-center">
            <Link to="/dashboard-penghuni" className="hover:underline transition">Dashboard</Link>
            <Link to="/layanan-penghuni" className="hover:underline transition">Layanan Penghuni</Link>
            <button onClick={() => setModalLogout(true)} className="hover:underline transition">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* WELCOME + PROFILE */}
        <section className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar — klik untuk ganti foto */}
          <button
            type="button"
            onClick={() => setModalProfile(true)}
            className="relative shrink-0 group"
            title="Klik untuk lihat/edit profil"
          >
            <img src={avatarUrl} alt={namaPenghuni} className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 shadow-md group-hover:opacity-80 transition" />
            {/* Edit overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-base text-gray-500">Selamat datang,</p>
            <h1 className="text-4xl font-extrabold text-gray-900 mt-0.5">{namaPenghuni}</h1>
            <p className="text-base text-gray-400 mt-1">Semoga harimu menyenangkan</p>
            <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full"> Kamar {nomorKamar}</span>
              <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full"> Penghuni Aktif</span>
              {formProfile.no_hp && <span className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full"> {formProfile.no_hp}</span>}
            </div>
          </div>

          {/* Tombol edit profil */}
          <button
            type="button"
            onClick={() => setModalProfile(true)}
            className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm active:scale-95 transition-all border border-blue-100"
          >
            Edit Profil
          </button>
        </section>

        {/* GRID UTAMA */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-6">
            {/* INFO KAMAR */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl p-7 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-75">Informasi Kamar</p>
              <h2 className="text-5xl font-extrabold mt-2 tracking-tight">{nomorKamar}</h2>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
                {dashData?.sewa ? `Kamar Aktif · ${hargaKamar}/bln` : "Belum ada kamar"}
              </div>
            </div>

            {/* AKSES CEPAT */}
            <div>
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest mb-3">Akses Cepat</h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => navigate("/detail-tagihan")} className="w-full">
                  <QuickCard image={pembayaran} label="Pembayaran" desc="Lihat & Bayar Tagihan" />
                </button>
                <button onClick={() => navigate("/riwayat")} className="w-full">
                  <QuickCard image={riwayat} label="Riwayat" desc="Riwayat Pembayaran" />
                </button>
                <button onClick={() => navigate("/pengumuman")} className="w-full">
                  <QuickCard image={pengumuman} label="Pengumuman" desc="Info Terbaru Kost" />
                </button>
              </div>
            </div>
          </div>

          {/* PENGUMUMAN TERBARU */}
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest">Pengumuman Terbaru</h3>
            </div>
            <div className="space-y-4 flex-1">
              {pengumumanList.length > 0 ? (
                pengumumanList.map((item: any, i: number) => (
                  <div key={item.id || i}>
                    <AnnouncementItem image={pengumuman} title="Pengumuman" desc={item.pesan} />
                    {i < pengumumanList.length - 1 && <div className="border-t border-gray-100 mt-4" />}
                  </div>
                ))
              ) : (
                <>
                  <AnnouncementItem image={pengumuman} title="Pemadaman Serentak" desc="Pemadaman Serentak akan dilakukan pada hari Senin, pukul 18.00 s.d 21.00 WIB" />
                  <div className="border-t border-gray-100" />
                  <AnnouncementItem image={pengumuman} title="Pembayaran Tepat Waktu" desc="Mohon lakukan pembayaran tagihan sebelum tanggal jatuh tempo" />
                </>
              )}
            </div>
            <button onClick={() => navigate("/pengumuman")} className="w-full mt-6 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 rounded-xl text-sm border border-blue-100 active:scale-95 transition-all duration-200">
              Lihat Semua Pengumuman →
            </button>
          </div>
        </section>

        {/* TAGIHAN */}
        <section className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center gap-2 bg-red-50 border-b border-red-100 px-7 py-3.5">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block shrink-0" />
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Tagihan Berikutnya</p>
          </div>
          <div className="p-7 flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex items-center gap-4 lg:w-52 shrink-0">
              <img src={tagihan} alt="Tagihan" className="w-14 h-14 object-contain" />
              <div>
                <p className="font-bold text-gray-800 text-sm leading-snug">
                  {tagihanAktif ? "Ada tagihan yang harus dibayarkan" : "Tidak ada tagihan aktif"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {tagihanAktif ? "Segera selesaikan sebelum jatuh tempo" : "Semua tagihan sudah lunas"}
                </p>
              </div>
            </div>
            <div className="hidden lg:block w-px h-16 bg-gray-200 shrink-0" />
            <div className="flex flex-1 flex-col sm:flex-row gap-6 items-center justify-around w-full">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Jatuh Tempo</p>
                <p className="text-3xl font-extrabold text-red-500 tracking-tight">{tagihanAktif?.jatuh_tempo || "-"}</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-red-100 shrink-0" />
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Estimasi Tagihan</p>
                <p className="text-3xl font-extrabold text-red-500 tracking-tight">{tagihanAktif?.jumlah_format || hargaKamar}</p>
              </div>
              <img src={estimasiTagihan} alt="Estimasi" className="w-16 h-16 object-contain opacity-75" />
            </div>
          </div>
          <div className="px-7 pb-6">
            <button onClick={() => navigate("/detail-tagihan")} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-base py-3.5 rounded-xl active:scale-95 transition-all duration-200 shadow-sm">
              Lihat Detail Tagihan
            </button>
          </div>
        </section>

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
          <button
            onClick={() => window.open(`https://wa.me/6285124485778?text=Halo Admin HOMIA, saya ${namaPenghuni} ingin bertanya.`, "_blank")}
            className="bg-white text-green-600 font-bold px-7 py-2.5 rounded-xl text-sm hover:bg-green-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0 flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.524 5.849L0 24l6.337-1.508A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.49-5.193-1.346L3 22l1.376-3.701A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Hubungi Admin
          </button>
        </section>
      </main>

      {/* ── MODAL PROFILE ── */}
      {modalProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setModalProfile(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalProfile(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center transition z-10">✕</button>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-t-2xl text-white text-center">
              <h2 className="text-xl font-extrabold">Profil Saya</h2>
              <p className="text-sm opacity-75 mt-1">Klik foto untuk menggantinya</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
                  <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 shadow group-hover:opacity-80 transition" />
                  <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Ganti Foto</span>
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                <p className="text-xs text-gray-400">Format: JPG, PNG · Maks 5MB</p>
              </div>

              {/* Form biodata */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input value={formProfile.nama} onChange={(e) => setFormProfile({ ...formProfile, nama: e.target.value })}
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                  <input value={formProfile.email} disabled
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                  <input value={formProfile.username} onChange={(e) => setFormProfile({ ...formProfile, username: e.target.value })}
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">No. HP</label>
                  <input value={formProfile.no_hp} onChange={(e) => setFormProfile({ ...formProfile, no_hp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Alamat Asal</label>
                  <textarea value={formProfile.alamat_asal} onChange={(e) => setFormProfile({ ...formProfile, alamat_asal: e.target.value })}
                    placeholder="Masukkan alamat asal kamu" rows={3}
                    className="w-full rounded-xl border border-blue-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>

                {/* Info kamar (read only) */}
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Info Kamar</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Nomor Kamar</span>
                    <span className="font-bold text-gray-800">{nomorKamar}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Harga Sewa</span>
                    <span className="font-bold text-gray-800">{hargaKamar}/bln</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tanggal Masuk</span>
                    <span className="font-bold text-gray-800">{dashData?.sewa?.tanggal_masuk || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="font-bold text-green-600">Aktif</span>
                  </div>
                </div>
              </div>

              {profileSuccess && <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-3 rounded-xl">{profileSuccess}</div>}
              {profileError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">{profileError}</div>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalProfile(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl active:scale-95 transition-all">Batal</button>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all disabled:opacity-60">
                  {savingProfile ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {modalLogout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setModalLogout(false)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl relative">
            <button onClick={() => setModalLogout(false)} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center transition">✕</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Logout?</h2>
            <p className="text-gray-500 text-sm mb-6">Apakah kamu yakin ingin keluar dari akun ini?</p>
            <div className="flex gap-3">
              <button onClick={() => setModalLogout(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-200">Batal</button>
              <button onClick={handleLogout} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-200">Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCard({ image, label, desc }: { image: string; label: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm text-center flex flex-col items-center gap-3 border-2 border-transparent hover:-translate-y-1 hover:shadow-lg hover:border-blue-100 active:scale-95 transition-all duration-200 cursor-pointer">
      <div className="rounded-xl p-3">
        <img src={image} alt={label} className="w-10 h-10 object-contain" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function AnnouncementItem({ image, title, desc }: { image: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-blue-50 rounded-xl p-2 shrink-0">
        <img src={image} alt={title} className="w-8 h-8 object-contain" />
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}
