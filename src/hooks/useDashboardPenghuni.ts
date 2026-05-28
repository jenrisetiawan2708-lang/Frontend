/**
 * useDashboardPenghuni - mengambil data dashboard penghuni dari backend
 * Gunakan di HomePenghuni.tsx untuk mengganti data hardcoded.
 */

import { useState, useEffect } from "react";
import { getDashboardPenghuni } from "../api/dashboard";

export interface DashboardPenghuniData {
  nama: string;
  sewa: {
    nomor_kamar: string;
    harga: number;
    harga_format: string;
    tanggal_masuk: string;
    status_sewa: string;
  } | null;
  tagihan_aktif: {
    id: number;
    bulan: string;
    jumlah: number;
    jumlah_format: string;
    jatuh_tempo: string;
  } | null;
  unread_notif: number;
}

export function useDashboardPenghuni() {
  const [data, setData] = useState<DashboardPenghuniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardPenghuni()
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch(() => setError("Gagal memuat data dashboard."))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
