/**
 * NotFound - Halaman 404
 * Tampil kalau URL tidak ditemukan
 */

import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

export default function NotFound() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleBack = () => {
    if (!user) {
      navigate("/");
    } else if (user.role === "owner") {
      navigate("/homeadmin");
    } else {
      navigate("/dashboard-penghuni");
    }
  };

  return (
    <div className="min-h-screen bg-[#e9eaec] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md w-full text-center">
        {/* Angka 404 besar */}
        <div className="relative mb-8">
          <p className="text-[120px] font-extrabold text-blue-100 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 rounded-2xl p-5 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
          <br />Periksa kembali alamat URL yang kamu masukkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm active:scale-95 transition-all duration-200"
          >
            ← Kembali
          </button>
          <button
            onClick={handleBack}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm active:scale-95 transition-all duration-200"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
