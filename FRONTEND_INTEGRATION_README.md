# HOMIA Frontend — Panduan Integrasi Backend

## Cara Menghubungkan Frontend ke Backend

### 1. Setup .env Frontend

Buat file `.env` di root folder frontend:
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 2. Install axios
```bash
npm install axios
```

### 3. Integrasi Per Halaman (Cara Pakai Hooks)

Semua hooks sudah siap di `src/hooks/`. Import dan gunakan di halaman yang sudah ada.

---

## Integrasi Per Halaman

### Login.tsx
Ganti `handleLogin`, `handleAdminLogin`, `handleGoogleLogin` dengan backend calls:

```tsx
import { useLogin } from "../hooks/useLogin";

// Di dalam komponen Login:
const { handleLoginBackend, handleAdminLoginBackend, handleGoogleLoginBackend } = useLogin();

// Ganti handleLogin:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  resetAllErrors();
  if (!email || !password) { setErrorMsg("Email dan password tidak boleh kosong."); return; }
  await handleLoginBackend(email, password, setErrorMsg);
};

// Ganti handleAdminLogin:
const handleAdminLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  resetAllErrors();
  if (!adminUsername || !adminPassword) { setErrorMsg("Username dan password wajib diisi."); return; }
  await handleAdminLoginBackend(adminUsername, adminPassword, setErrorMsg);
};

// Ganti handleGoogleLogin:
const handleGoogleLogin = () => {
  resetAllErrors();
  handleGoogleLoginBackend(setErrorMsg, setIsGoogleLoading);
};

// Ganti handleForgotPassword (kirim email asli):
import { forgotPassword } from "../api/auth";
const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  resetAllErrors();
  if (!resetEmail.trim()) { setErrorMsg("Masukkan email atau username."); return; }
  try {
    await forgotPassword(resetEmail);
    setView("checkEmail");
  } catch {
    setErrorMsg("Gagal mengirim instruksi reset.");
  }
};
```

---

### Register.tsx
```tsx
import { register } from "../api/auth";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.nama || !form.email || !form.password) { alert("Semua field wajib diisi!"); return; }
  if (!form.agree) { alert("Harap setujui ketentuan."); return; }
  try {
    await register({
      nama: form.nama,
      email: form.email,
      username: form.email.split("@")[0], // atau tambah field username di form
      password: form.password,
    });
    navigate("/dashboard-penghuni");
  } catch (err: any) {
    alert(err.response?.data?.message || "Registrasi gagal.");
  }
};
```

---

### HomePenghuni.tsx
```tsx
import { useDashboardPenghuni } from "../hooks/useDashboardPenghuni";
import { logout } from "../api/auth";

// Di dalam komponen:
const { data, loading } = useDashboardPenghuni();

// Ganti namaPenghuni:
const namaPenghuni = data?.nama || localStorage.getItem("namaPenghuni") || "Penghuni";

// Ganti handleLogout:
const handleLogout = async () => {
  await logout();
  navigate("/login");
};
```

---

### HomeAdmin.tsx
```tsx
import { useDashboardAdmin } from "../hooks/useDashboardAdmin";
import { logout } from "../api/auth";

const { data, loading } = useDashboardAdmin();

// data.kamar.total, data.kamar.terisi, data.kamar.kosong
// data.penghuni_total
// data.tagihan_bulan_ini.sudah_bayar
// data.pendapatan_bulan_ini
// data.menunggu_validasi
// data.grafik_pendapatan  → array [{bulan, pendapatan}]

const handleLogout = async () => {
  await logout();
  navigate("/login");
};
```

---

### DetailTagihan.tsx
```tsx
import { useTagihan } from "../hooks/useTagihan";

const { tagihans, loading } = useTagihan();

// tagihans[0] = tagihan aktif terbaru (Belum Dibayar)
// Gunakan data dari API menggantikan dataTagihan hardcoded
```

---

### FormPembayaran.tsx — Dua Mode Pembayaran

#### Mode 1: Upload Bukti Manual
```tsx
import { uploadBuktiPembayaran } from "../api/pembayaran";

const handleUploadBukti = async () => {
  if (!buktiFileObj) { setError("Pilih file bukti terlebih dahulu."); return; }
  try {
    await uploadBuktiPembayaran({
      id_tagihan: idTagihanAktif,        // ambil dari useTagihan
      jumlah_bayar: dataPembayaran.tagihan,
      bukti: buktiFileObj,               // File object dari <input type="file">
      tanggal_pembayaran: new Date().toISOString().split("T")[0],
    });
    setModalSuccess(true);
  } catch (err: any) {
    setError(err.response?.data?.message || "Upload gagal.");
  }
};
```

#### Mode 2: Bayar via Midtrans (Payment Gateway)
```tsx
import { bayarDenganMidtrans } from "../api/midtrans";

const handleBayarMidtrans = async () => {
  try {
    await bayarDenganMidtrans(idTagihanAktif, {
      onSuccess: () => {
        setModalSuccess(true);    // popup sukses muncul
      },
      onPending: () => {
        alert("Pembayaran pending, silakan selesaikan.");
      },
      onError: () => {
        setError("Pembayaran gagal. Coba lagi.");
      },
      onClose: () => {
        console.log("Popup ditutup");
      },
    });
  } catch (err: any) {
    setError(err.response?.data?.message || "Gagal membuka payment gateway.");
  }
};
```

---

### ForumKomunikasi.tsx
```tsx
import { useForum } from "../hooks/useForum";

const { messages, loading, sendMessage } = useForum();

// Ganti initialMessages dengan messages dari backend
// Ganti send handler:
const handleSend = async () => {
  if (!input.trim()) return;
  await sendMessage(input.trim());
  setInput("");
};
```

---

### Pengumuman.tsx (Penghuni lihat pengumuman)
```tsx
import { getPengumuman } from "../api/pengumuman";
import { useEffect, useState } from "react";

const [pengumuman, setPengumuman] = useState([]);
useEffect(() => {
  getPengumuman().then(res => { if (res.success) setPengumuman(res.data); });
}, []);
```

---

### riwayat.tsx
```tsx
import { getPembayaran } from "../api/pembayaran";
import { useEffect, useState } from "react";

const [riwayat, setRiwayat] = useState([]);
useEffect(() => {
  getPembayaran().then(res => { if (res.success) setRiwayat(res.data); });
}, []);
```

---

## Struktur Folder Baru di src/

```
src/
├── api/
│   ├── axios.ts          ← Axios instance + interceptors
│   ├── auth.ts           ← Login, Register, Google, Forgot/Reset password, Logout
│   ├── dashboard.ts      ← Dashboard data penghuni & admin
│   ├── penghuni.ts       ← CRUD penghuni
│   ├── kamar.ts          ← Data kamar
│   ├── tagihan.ts        ← Tagihan (list, detail, generate)
│   ├── pembayaran.ts     ← Upload bukti & validasi admin
│   ├── midtrans.ts       ← Payment gateway Midtrans Snap
│   ├── forum.ts          ← Forum komunikasi
│   ├── notifikasi.ts     ← Notifikasi & mark read
│   ├── pengumuman.ts     ← Pengumuman admin → penghuni
│   └── index.ts          ← Barrel export
│
└── hooks/
    ├── useAuth.ts               ← State user aktif
    ├── useLogin.ts              ← Login handler (penghuni, admin, Google)
    ├── useDashboardPenghuni.ts  ← Data dashboard penghuni
    ├── useDashboardAdmin.ts     ← Data dashboard admin
    ├── useTagihan.ts            ← Data tagihan
    ├── useForum.ts              ← Forum + polling 15s
    └── useNotifikasi.ts         ← Notifikasi + unread count
```
