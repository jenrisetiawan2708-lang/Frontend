import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    agree: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.nama || !form.email || !form.password) {
      setErrorMsg("Semua field wajib diisi!");
      return;
    }

    if (!form.agree) {
      setErrorMsg("Harap setujui ketentuan terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        nama: form.nama,
        email: form.email,
        username: form.email.split("@")[0],
        password: form.password,
      });

      if (res.success) {
        navigate("/dashboard-penghuni");
      } else {
        setErrorMsg(res.message || "Registrasi gagal. Coba lagi.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else {
        setErrorMsg(msg || "Registrasi gagal. Coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] font-poppins px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-300 text-white text-2xl font-bold py-6 px-6">
          Buat Akun HOMIA
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Nama lengkap kamu"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Kata Sandi</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-blue-400 p-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Minimal 8 karakter + angka"
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-blue-500">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => setForm({ ...form, agree: e.target.checked })}
              className="mt-0.5"
            />
            <p>
              Dengan klik tombol daftar, saya menyetujui{" "}
              <span className="underline font-medium">ketentuan layanan HOMIA</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-300 text-white py-2 rounded-full text-sm font-semibold shadow hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Mendaftarkan..." : "SETUJU & BERGABUNG"}
          </button>

          <p className="text-center text-xs text-blue-500">
            Sudah memiliki akun di HOMIA?{" "}
            <Link to="/login" className="underline font-medium">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
