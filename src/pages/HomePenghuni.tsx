import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { getDashboardPenghuni } from "../api/dashboard";
import { getPengumuman } from "../api/pengumuman";

// ASSETS
import heroImg from "../assets/logo-navbar.png";
import estimasiTagihan from "../assets/estimasi-tagihan.png";
import pembayaran from "../assets/pembayaran.png";
import tagihan from "../assets/tagihan.png";
import riwayat from "../assets/riwayat.png";
import pengumuman from "../assets/pengumuman.png";
import telepon from "../assets/telepon.png";

export default function HomePenghuni() {
  const navigate = useNavigate();
  const [modalLogout, setModalLogout] = useState(false);

  const [dashData, setDashData] = useState<any>(null);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);

  useEffect(() => {
    getDashboardPenghuni()
      .then((res) => { if (res.success) setDashData(res.data); })
      .catch(() => {});

    getPengumuman()
      .then((res) => { if (res.success) setPengumumanList(res.data.slice(0, 2)); })
      .catch(() => {});
  }, []);

  const namaPenghuni = dashData?.nama || localStorage.getItem("namaPenghuni") || "Penghuni";
  const nomorKamar = dashData?.sewa?.nomor_kamar || "P07";
  const hargaKamar = dashData?.sewa?.harga_format || "Rp 1.500.000";
  const tagihanAktif = dashData?.tagihan_aktif;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* WELCOME */}
        <section>
          <p className="text-lg text-gray-500">Selamat datang,</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-0.5">{namaPenghuni}</h1>
          <p className="text-base text-gray-400 mt-1">Semoga harimu menyenangkan</p>
        </section>

        {/* GRID UTAMA */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* INFO KAMAR */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-2xl p-7 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-75">Informasi Kamar</p>
              <h2 className="text-5xl font-extrabold mt-2 tracking-tight">{nomorKamar}</h2>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
                {dashData?.sewa ? `Kamar Aktif · ${hargaKamar}/bln` : "Lantai 1 · Kamar Ekonomis"}
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

          {/* RIGHT — PENGUMUMAN TERBARU */}
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-500 uppercase tracking-widest">Pengumuman Terbaru</h3>
            </div>

            <div className="space-y-4 flex-1">
              {pengumumanList.length > 0 ? (
                pengumumanList.map((item: any, i: number) => (
                  <div key={item.id || i}>
                    <AnnouncementItem
                      image={pengumuman}
                      title={`Pengumuman`}
                      desc={item.pesan}
                    />
                    {i < pengumumanList.length - 1 && <div className="border-t border-gray-100 mt-4" />}
                  </div>
                ))
              ) : (
                <>
                  <AnnouncementItem
                    image={pengumuman}
                    title="Pemadaman Serentak"
                    desc="Pemadaman Serentak akan dilakukan pada hari Senin, pukul 18.00 s.d 21.00 WIB"
                  />
                  <div className="border-t border-gray-100" />
                  <AnnouncementItem
                    image={pengumuman}
                    title="Pembayaran Tepat Waktu"
                    desc="Mohon lakukan pembayaran tagihan sebelum tanggal jatuh tempo"
                  />
                </>
              )}
            </div>

            <button
              onClick={() => navigate("/pengumuman")}
              className="w-full mt-6 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold
                py-3 rounded-xl text-sm border border-blue-100 active:scale-95 transition-all duration-200"
            >
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
                <p className="text-3xl font-extrabold text-red-500 tracking-tight">
                  {tagihanAktif?.jatuh_tempo || "10 Mei 2026"}
                </p>
              </div>

              <div className="hidden sm:block w-px h-12 bg-red-100 shrink-0" />

              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Estimasi Tagihan</p>
                <p className="text-3xl font-extrabold text-red-500 tracking-tight">
                  {tagihanAktif?.jumlah_format || hargaKamar}
                </p>
              </div>

              <img src={estimasiTagihan} alt="Estimasi" className="w-16 h-16 object-contain opacity-75" />
            </div>
          </div>

          <div className="px-7 pb-6">
            <button
              onClick={() => navigate("/detail-tagihan")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold
                text-base py-3.5 rounded-xl active:scale-95 transition-all duration-200 shadow-sm"
            >
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
            onClick={() => navigate("/hubungi-admin")}
            className="bg-white text-blue-600 font-bold px-7 py-2.5 rounded-xl text-sm
              hover:bg-blue-50 active:scale-95 transition-all duration-200 shadow-sm shrink-0"
          >
            Hubungi Admin
          </button>
        </section>
      </main>

      {/* MODAL LOGOUT */}
      {modalLogout && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModalLogout(false)}
        >
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setModalLogout(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center transition"
            >✕</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Logout?</h2>
            <p className="text-gray-500 text-sm mb-6">Apakah kamu yakin ingin keluar dari akun ini?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalLogout(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-200"
              >Batal</button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-all duration-200"
              >Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCard({ image, label, desc }: { image: string; label: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm text-center flex flex-col items-center gap-3
      border-2 border-transparent hover:-translate-y-1 hover:shadow-lg hover:border-blue-100
      active:scale-95 transition-all duration-200 cursor-pointer">
      <div className="bg-blue-0 rounded-xl p-3">
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
