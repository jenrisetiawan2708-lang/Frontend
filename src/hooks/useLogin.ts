/**
 * useLogin - hook integrasi backend untuk halaman Login.tsx
 * Import ini di Login.tsx dan ganti handler dummy dengan yang asli.
 *
 * Cara pakai:
 *   const { handleLoginBackend, handleAdminLoginBackend, handleGoogleLoginBackend } = useLogin();
 *   Lalu di handleLogin / handleAdminLogin, panggil fungsi ini.
 */

import { useNavigate } from "react-router-dom";
import { loginPenghuni, loginAdmin, loginWithGoogle } from "../api/auth";

export function useLogin() {
  const navigate = useNavigate();

  const handleLoginBackend = async (
    email: string,
    password: string,
    setErrorMsg: (msg: string) => void
  ) => {
    try {
      const res = await loginPenghuni(email, password);
      if (res.success) {
        navigate("/dashboard-penghuni");
      } else {
        setErrorMsg(res.message || "Login gagal.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr.response?.data?.message || "Login gagal. Periksa koneksi.");
    }
  };

  const handleAdminLoginBackend = async (
    username: string,
    password: string,
    setErrorMsg: (msg: string) => void
  ) => {
    try {
      const res = await loginAdmin(username, password);
      if (res.success) {
        navigate("/homeadmin");
      } else {
        setErrorMsg(res.message || "Login admin gagal.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr.response?.data?.message || "Username atau password admin salah.");
    }
  };

  const handleGoogleLoginBackend = async (
    setErrorMsg: (msg: string) => void,
    setIsGoogleLoading: (v: boolean) => void
  ) => {
    setIsGoogleLoading(true);
    try {
      // Inisialisasi Google Identity Services
      const googleAuth = await initGoogleOAuth();
      if (!googleAuth) {
        setErrorMsg("Google OAuth belum dikonfigurasi. Hubungi admin.");
        return;
      }
      // googleAuth.idToken sudah didapat via popup Google
      const res = await loginWithGoogle(googleAuth.idToken);
      if (res.success) {
        navigate("/dashboard-penghuni");
      } else {
        setErrorMsg(res.message || "Login Google gagal.");
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr.response?.data?.message || "Login Google gagal.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return { handleLoginBackend, handleAdminLoginBackend, handleGoogleLoginBackend };
}

// ── Google Identity Services ──────────────────────────────────────────────
async function initGoogleOAuth(): Promise<{ idToken: string } | null> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  return new Promise((resolve, reject) => {
    // Load Google Identity Services script kalau belum ada
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => openGooglePopup(clientId, resolve, reject);
      script.onerror = () => reject(new Error("Gagal load Google script"));
      document.head.appendChild(script);
    } else {
      openGooglePopup(clientId, resolve, reject);
    }
  });
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          prompt: (callback?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

function openGooglePopup(
  clientId: string,
  resolve: (v: { idToken: string }) => void,
  reject: (e: Error) => void
) {
  if (!window.google) { reject(new Error("Google SDK tidak tersedia")); return; }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: { credential: string }) => {
      resolve({ idToken: response.credential });
    },
  });

  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      reject(new Error("Google popup ditutup atau tidak tersedia"));
    }
  });
}
