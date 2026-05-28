/**
 * useNotifikasi
 */

import { useState, useEffect } from "react";
import { getNotifikasi, tandaiBaca, tandaiSemuaBaca } from "../api/notifikasi";

export function useNotifikasi() {
  const [notifikasis, setNotifikasis] = useState<unknown[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    getNotifikasi()
      .then((res) => {
        if (res.success) {
          setNotifikasis(res.data);
          setUnreadCount(res.unread_count);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id: number) => {
    await tandaiBaca(id);
    setNotifikasis((prev) =>
      (prev as { id: number; status_baca: string }[]).map((n) =>
        n.id === id ? { ...n, status_baca: "Dibaca" } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await tandaiSemuaBaca();
    setNotifikasis((prev) =>
      (prev as { status_baca: string }[]).map((n) => ({ ...n, status_baca: "Dibaca" }))
    );
    setUnreadCount(0);
  };

  return { notifikasis, unreadCount, loading, markRead, markAllRead, refetch: fetch };
}
