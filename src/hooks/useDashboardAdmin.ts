/**
 * useDashboardAdmin - data dashboard admin dari backend
 */

import { useState, useEffect } from "react";
import { getDashboardAdmin } from "../api/dashboard";

export function useDashboardAdmin() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardAdmin()
      .then((res) => { if (res.success) setData(res.data); })
      .catch(() => setError("Gagal memuat data admin."))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
