/**
 * useForum - forum komunikasi dengan backend
 */

import { useState, useEffect, useCallback } from "react";
import { getForum, kirimPesan, hapusPesan } from "../api/forum";

export function useForum() {
  const [messages, setMessages] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(() => {
    getForum()
      .then((res) => { if (res.success) setMessages(res.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    // Polling setiap 15 detik untuk real-time feel
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (text: string, parentId?: number) => {
    const res = await kirimPesan(text, parentId);
    if (res.success) {
      setMessages((prev) => [...prev as unknown[], res.data] as unknown[]);
    }
    return res;
  };

  const deleteMessage = async (id: number) => {
    const res = await hapusPesan(id);
    if (res.success) {
      setMessages((prev) => (prev as { id: number }[]).filter((m) => m.id !== id));
    }
    return res;
  };

  return { messages, loading, sendMessage, deleteMessage, refetch: fetchMessages };
}
