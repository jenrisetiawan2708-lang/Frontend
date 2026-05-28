import api from "./axios";

export interface User {
  id: number;
  nama: string;
  email: string;
  username: string;
  role: "penghuni" | "owner";
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// Simpan auth ke localStorage
function saveAuth(token: string, user: User) {
  localStorage.setItem("homia_token", token);
  localStorage.setItem("homia_user", JSON.stringify(user));
  // Kompatibilitas dengan frontend lama
  if (user.role === "owner") {
    localStorage.setItem("isLoginAdmin", "true");
  } else {
    localStorage.setItem("isLoginPenghuni", "true");
    localStorage.setItem("namaPenghuni", user.nama);
  }
}

export function clearAuth() {
  ["homia_token", "homia_user", "isLoginPenghuni", "isLoginAdmin", "namaPenghuni"].forEach(
    (k) => localStorage.removeItem(k)
  );
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("homia_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("homia_token");
}

// ── LOGIN PENGHUNI ──────────────────────────────────────────────────────
export async function loginPenghuni(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  if (data.success) saveAuth(data.token, data.user);
  return data;
}

// ── LOGIN ADMIN ─────────────────────────────────────────────────────────
export async function loginAdmin(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login-admin", { username, password });
  if (data.success) saveAuth(data.token, data.user);
  return data;
}

// ── REGISTER ────────────────────────────────────────────────────────────
export async function register(payload: {
  nama: string;
  email: string;
  username: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", payload);
  if (data.success) saveAuth(data.token, data.user);
  return data;
}

// ── GOOGLE LOGIN ────────────────────────────────────────────────────────
export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/google", { id_token: idToken });
  if (data.success) saveAuth(data.token, data.user);
  return data;
}

// ── FORGOT / RESET PASSWORD ─────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
}

// ── LOGOUT ───────────────────────────────────────────────────────────────
export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    clearAuth();
  }
}

// ── ME ────────────────────────────────────────────────────────────────────
export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}
