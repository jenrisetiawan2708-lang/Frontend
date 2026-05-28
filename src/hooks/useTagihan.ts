/**
 * useTagihan - data tagihan penghuni dari backend
 */

import { useState, useEffect } from "react";
import { getTagihan, getTagihanDetail } from "../api/tagihan";

export function useTagihan() {
  const [tagihans, setTagihans] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    getTagihan()
      .then((res) => { if (res.success) setTagihans(res.data); })
      .catch(() => setError("Gagal memuat tagihan."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []);

  return { tagihans, loading, error, refetch };
}

export function useTagihanDetail(id: number) {
  const [tagihan, setTagihan] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTagihanDetail(id)
      .then((res) => { if (res.success) setTagihan(res.data); })
      .finally(() => setLoading(false));
  }, [id]);

  return { tagihan, loading };
}
