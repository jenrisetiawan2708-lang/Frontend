import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ── Request interceptor: tambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("homia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("homia_token");
      localStorage.removeItem("homia_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
