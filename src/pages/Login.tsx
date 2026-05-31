import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginPenghuni, loginAdmin, forgotPassword } from "../api/auth";

type LoginView =
  | "penghuni"
  | "forgot"
  | "checkEmail"
  | "resetPassword"
  | "admin";

export default function Login() {
  const navigate = useNavigate();

  // Deteksi session expired
  const [sessionExpired, setSessionExpired] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "1") {
      setSessionExpired(true);
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  const [view, setView] = useState<LoginView>("penghuni");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const passwordRules = {
    minLength: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    isMatch: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const resetAllErrors = () => setErrorMsg("");

  // ── LOGIN PENGHUNI (Backend) ──────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAllErrors();

    if (!email || !password) {
      setErrorMsg("Email dan password tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginPenghuni(email, password);
      if (res.success) {
        navigate("/dashboard-penghuni");
      } else {
        setErrorMsg(res.message || "Login gagal.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── LOGIN ADMIN (Backend) ─────────────────────────────────────────
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAllErrors();

    if (!adminUsername || !adminPassword) {
      setErrorMsg("Username dan password admin wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdmin(adminUsername, adminPassword);
      if (res.success) {
        navigate("/homeadmin");
      } else {
        setErrorMsg(res.message || "Username atau password admin salah.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Username atau password admin salah.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── GOOGLE LOGIN ──────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    resetAllErrors();
    setIsGoogleLoading(true);

    // Google Identity Services
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErrorMsg("Google login belum dikonfigurasi. Hubungi admin.");
      setIsGoogleLoading(false);
      return;
    }

    const loadAndPrompt = () => {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            const { loginWithGoogle } = await import("../api/auth");
            const res = await loginWithGoogle(response.credential);
            if (res.success) {
              navigate("/dashboard-penghuni");
            } else {
              setErrorMsg(res.message || "Login Google gagal.");
            }
          } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Login Google gagal.");
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setErrorMsg("Popup Google ditutup atau tidak tersedia.");
          setIsGoogleLoading(false);
        }
      });
    };

    if ((window as any).google) {
      loadAndPrompt();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = loadAndPrompt;
      script.onerror = () => {
        setErrorMsg("Gagal memuat Google Sign-In.");
        setIsGoogleLoading(false);
      };
      document.head.appendChild(script);
    }
  };

  // ── FORGOT PASSWORD (Backend) ─────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAllErrors();

    if (!resetEmail.trim()) {
      setErrorMsg("Masukkan email atau username yang terdaftar.");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(resetEmail);
      setView("checkEmail");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Gagal mengirim instruksi reset. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── RESET PASSWORD (lokal – link asli dikirim via email) ──────────
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetAllErrors();

    if (!passwordRules.minLength || !passwordRules.hasNumber || !passwordRules.isMatch) {
      setErrorMsg("Pastikan kata sandi memenuhi semua persyaratan.");
      return;
    }

    setEmail(resetEmail);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setView("penghuni");
  };

  return (
    <div className="min-h-screen bg-[#e9eaec] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[430px] overflow-hidden rounded-3xl bg-white shadow-xl">
        {sessionExpired && (
          <div className="mx-7 mt-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 font-semibold flex items-center gap-2">
            ⚠️ Sesi kamu telah berakhir. Silakan login kembali.
          </div>
        )}

        {view === "penghuni" && (
          <>
            <AuthHeader
              title="Masuk ke HOMIA"
              subtitle="Login untuk melanjutkan sebagai penghuni"
            />

            <form onSubmit={handleLogin} className="p-7">
              <ErrorMessage message={errorMsg} />

              <TextField
                label="Email / Username"
                value={email}
                onChange={setEmail}
                placeholder="Masukkan email"
              />

              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Masukkan password"
              />

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("forgot"); }}
                className="mb-5 text-sm font-semibold text-blue-500 hover:underline"
              >
                Lupa Kata Sandi?
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 py-3 font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "MASUK SEBAGAI PENGHUNI"}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 py-3 font-bold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <><SpinnerIcon />Menghubungkan...</>
                ) : (
                  <><GoogleIcon />MASUK DENGAN GOOGLE</>
                )}
              </button>

              <Divider />

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("admin"); }}
                className="w-full rounded-full bg-gray-900 py-3 font-bold text-white transition hover:bg-black active:scale-95"
              >
                LOGIN SEBAGAI ADMIN
              </button>

              <div className="mt-6 flex justify-between text-sm text-blue-500">
                <Link to="/register" className="hover:underline">Buat Akun</Link>
                <Link to="/" className="hover:underline">Kembali</Link>
              </div>
            </form>
          </>
        )}

        {view === "admin" && (
          <>
            <AuthHeader title="Login Admin" subtitle="Masuk dengan akun admin HOMIA" />

            <form onSubmit={handleAdminLogin} className="p-7">
              <ErrorMessage message={errorMsg} />

              <TextField
                label="Username Admin"
                value={adminUsername}
                onChange={setAdminUsername}
                placeholder="Contoh: admin"
              />

              <PasswordField
                label="Password Admin"
                value={adminPassword}
                onChange={setAdminPassword}
                placeholder="Masukkan password admin"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-full bg-gray-900 py-3 font-bold text-white transition hover:bg-black active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "MASUK KE DASHBOARD ADMIN"}
              </button>

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("penghuni"); }}
                className="mt-5 w-full text-sm font-semibold text-blue-500 hover:underline"
              >
                Kembali ke Login Penghuni
              </button>
            </form>
          </>
        )}

        {view === "forgot" && (
          <>
            <AuthHeader title="Reset Kata Sandi" subtitle="Masukkan email atau username yang terdaftar" />

            <form onSubmit={handleForgotPassword} className="p-7">
              <ErrorMessage message={errorMsg} />

              <p className="mb-5 text-sm leading-relaxed text-gray-500">
                Kami akan mengirimkan instruksi untuk mereset kata sandi akun Anda.
              </p>

              <TextField
                label="Email / Username"
                value={resetEmail}
                onChange={setResetEmail}
                placeholder="Masukkan email atau username"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Mengirim..." : "KIRIM INSTRUKSI"}
              </button>

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("penghuni"); }}
                className="mt-5 w-full text-sm font-semibold text-blue-500 hover:underline"
              >
                Kembali ke Login
              </button>
            </form>
          </>
        )}

        {view === "checkEmail" && (
          <>
            <AuthHeader title="Cek Email Anda" subtitle="Instruksi reset kata sandi telah dikirim" />

            <div className="p-7 text-center">
              <MailIcon />

              <p className="mt-5 text-sm leading-relaxed text-gray-500">
                Kami telah mengirim email berisi link untuk mereset kata sandi ke:
              </p>

              <p className="mt-2 font-extrabold text-gray-900">
                {resetEmail || "user@gmail.com"}
              </p>

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("resetPassword"); }}
                className="mt-6 w-full rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                Buat Kata Sandi Baru
              </button>

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("penghuni"); }}
                className="mt-5 w-full text-sm font-semibold text-blue-500 hover:underline"
              >
                Kembali ke Login
              </button>
            </div>
          </>
        )}

        {view === "resetPassword" && (
          <>
            <AuthHeader title="Buat Kata Sandi Baru" subtitle="Pastikan kata sandi baru aman dan mudah diingat" />

            <form onSubmit={handleResetPassword} className="p-7">
              <ErrorMessage message={errorMsg} />

              <PasswordField
                label="Kata Sandi Baru"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Masukkan kata sandi baru"
              />

              <PasswordField
                label="Konfirmasi Kata Sandi"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Ulangi kata sandi baru"
              />

              <div className="mb-5 space-y-2 rounded-2xl bg-blue-50 p-4 text-sm">
                <RuleItem active={passwordRules.minLength}>Minimal 8 karakter</RuleItem>
                <RuleItem active={passwordRules.hasNumber}>Mengandung huruf dan angka</RuleItem>
                <RuleItem active={passwordRules.isMatch}>Kata sandi cocok</RuleItem>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                SIMPAN KATA SANDI
              </button>

              <button
                type="button"
                onClick={() => { resetAllErrors(); setView("penghuni"); }}
                className="mt-5 w-full text-sm font-semibold text-blue-500 hover:underline"
              >
                Kembali ke Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-300 p-7">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-1 text-sm text-blue-100">{subtitle}</p>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block font-semibold text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-blue-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-5">
      <label className="mb-2 block font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-blue-300 px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center">
      <div className="flex-1 border-t border-gray-300" />
      <span className="px-3 text-sm text-gray-400">ATAU</span>
      <div className="flex-1 border-t border-gray-300" />
    </div>
  );
}

function RuleItem({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2 font-semibold ${active ? "text-green-600" : "text-gray-400"}`}>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${active ? "bg-green-500" : "bg-gray-300"}`}>✓</span>
      <span>{children}</span>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.3 13 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.3 5.7c4.3-4 6.8-9.8 7.1-16.7z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.6-1.8-.9-3.7-.9-5.6s.3-3.8.9-5.6L2.6 11.3C.9 14.8 0 18.8 0 23s.9 8.2 2.6 11.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 46c6.3 0 11.6-2.1 15.5-5.7l-7.3-5.7c-2.1 1.4-4.7 2.2-8.2 2.2-6.3 0-11.7-3.5-13.5-8.5l-7.9 6.1C6.6 42.6 14.6 46 24 46z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-blue-600">
        <path d="M12 18h40v28H12V18Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="m12 20 20 16 20-16" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
