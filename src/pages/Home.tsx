import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

// ASSETS
import heroImg from "../assets/home.png";
import tentangImg from "../assets/logo-tentang.png";

import forum from "../assets/forum-komunikasi.png";
import cleaning from "../assets/cleaning.png";
import jatuhTempo from "../assets/jatuh-tempo.png";
import deposit from "../assets/deposit-denda.png";

import ac from "../assets/ac.png";
import wifi from "../assets/wifi.png";
import km from "../assets/km-dalam.png";
import tv from "../assets/smart-tv.png";
import laundry from "../assets/laundry.png";
import kulkas from "../assets/kulkas.png";
import gym from "../assets/gym.png";
import dapur from "../assets/dapur-umum.png";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen font-poppins">
      <Navbar />

      {/* HERO */}
      <div className="max-w-6xl mx-auto mt-6 px-6">
        <div className="relative rounded-2xl overflow-hidden shadow-md">
          <img
            src={heroImg}
            alt="Hero"
            className="w-full h-[320px] object-cover"
          />

          <div className="absolute inset-0 bg-blue-500/80 flex items-center">
            <div className="px-10 text-white flex flex-col gap-1.5 animate-fadeUp">
              {/* GLASS */}
              <div className="inline-block">
                <div className="relative inline-flex items-center">
                  <div className="absolute inset-0 bg-white/30 blur-md rounded-md"></div>

                  <div className="relative bg-white/20 backdrop-blur-md border border-white/30 px-2 py-0.5 rounded-md">
                    <p className="text-xs font-medium whitespace-nowrap">
                      Selamat Datang di
                    </p>
                  </div>
                </div>
              </div>

              {/* TITLE */}
              <h1 className="text-6xl font-bold leading-none tracking-wide">
                HOMIA
              </h1>

              <p className="text-base font-medium">Smart Way To Stay</p>

              {/* BUTTON REGISTER */}
              <Link to="/register">
                <button className="mt-2 bg-white text-blue-600 px-5 py-2 rounded-md text-sm font-semibold inline-block hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-300">
                  Daftar Sekarang
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TENTANG */}
      
      <div className="max-w-6xl mx-auto mt-16 px-6">
        <div className="bg-white rounded-2xl shadow-md p-6 flex gap-6 items-center animate-fadeUp">
          <img src={tentangImg} alt="Tentang HOMIA" className="w-40" />

          <div>
            <h2 className="text-2xl font-bold">
              Tentang <span className="text-blue-600">HOMIA</span>
            </h2>

            <p className="text-gray-600 mt-3 text-sm leading-loose">
              <b>HOMIA</b> adalah platform hunian modern yang dirancang untuk
              memberikan <b>kemudahan dan kenyamanan</b> bagi penghuni dalam
              menjalani kehidupan sehari-hari di kos.
            </p>

            <p className="text-gray-600 mt-2 text-sm leading-loose">
              Dengan <b>sistem digital terintegrasi</b>, HOMIA membantu penghuni
              dalam mengelola berbagai kebutuhan secara
              <b> praktis, efisien, dan aman</b>.
            </p>

            <p className="text-gray-500 mt-2 text-sm leading-loose">
              Kami menghadirkan lingkungan hunian dengan
              <b> fasilitas lengkap</b>, layanan profesional, serta teknologi
              yang mendukung gaya hidup modern.
            </p>
          </div>
        </div>
      </div>

      {/* FITUR */}
      <div className="max-w-6xl mx-auto mt-16 px-6 text-center">
        <h2 className="text-2xl font-bold">
          Fitur <span className="text-blue-600">HOMIA</span>
        </h2>

        <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto leading-loose">
          <b>Berbagai fitur yang kami sediakan</b> untuk membantu penghuni
          menjalani kehidupan yang lebih mudah dan nyaman
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
          {[
            {
              title: "Forum Komunikasi",
              icon: forum,
              desc: "Wadah komunikasi antar penghuni untuk berbagi informasi dan berdiskusi dengan mudah",
            },
            {
              title: "Cleaning Service",
              icon: cleaning,
              desc: "Fitur layanan kebersihan untuk membantu penghuni menjaga kenyamanan kamar",
            },
            {
              title: "Pengingat Jatuh Tempo",
              icon: jatuhTempo,
              desc: "Notifikasi otomatis untuk mengingatkan jadwal pembayaran kos",
            },
            {
              title: "Deposit Dana",
              icon: deposit,
              desc: "Pengelolaan deposit serta pencatatan denda secara transparan",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-md flex gap-4 items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeUp"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <img src={item.icon} alt={item.title} className="w-[80px]" />

              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>

                <p className="text-sm text-gray-500 leading-loose">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FASILITAS */}
      <div className="max-w-6xl mx-auto mt-16 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-md animate-fadeUp">
          <h2 className="text-2xl font-bold mb-8">
            Fasilitas <span className="text-blue-600">HOMIA</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-y-8 gap-x-4 place-items-center">
            {[
              { name: "", icon: ac },
              { name: "", icon: wifi },
              { name: "", icon: km },
              { name: "", icon: tv },
              { name: "", icon: laundry },
              { name: "", icon: kulkas },
              { name: "", icon: gym },
              { name: "", icon: dapur },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-start w-full transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              >
                <div className="w-[90px] h-[90px] flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-[80px] h-[80px] object-contain"
                  />
                </div>

                <p className="text-sm font-medium text-gray-700 text-center mt-2 min-h-[20px]">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 bg-blue-600 text-white py-8 animate-fadeUp">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">HOMIA</h3>

            <p className="text-blue-100">Smart Way To Stay</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Address</h3>

            <p className="text-blue-100">Jl. Cempaka Putih Tengah No.12</p>

            <p className="text-blue-100">DKI Jakarta, Indonesia</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Contact</h3>

            <p className="text-blue-100">+62 895 3384 5752</p>

            <p className="text-blue-100">+62 851 2448 5778</p>
          </div>
        </div>

        <div className="text-center text-xs text-blue-200 mt-6">
          ©️ 2026 HOMIA. All rights reserved.
        </div>
      </div>
    </div>
  );
}
