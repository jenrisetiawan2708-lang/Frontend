import api from "./axios";

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: SnapOptions) => void;
      hide: () => void;
    };
  }
}

interface SnapOptions {
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onError?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
}

// Muat Midtrans Snap JS
function loadSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (window.snap) return resolve();
    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export async function bayarDenganMidtrans(
  idTagihan: number,
  callbacks: SnapOptions
): Promise<void> {
  // 1. Buat transaksi di backend
  const { data } = await api.post("/midtrans/create-transaction", { id_tagihan: idTagihan });

  if (!data.success) {
    throw new Error(data.message || "Gagal membuat transaksi");
  }

  // 2. Muat Snap.js
  await loadSnapScript(data.midtrans_client_key, data.is_production);

  // 3. Tampilkan popup Snap
  window.snap.pay(data.snap_token, {
    onSuccess: (result) => {
      console.log("Pembayaran berhasil:", result);
      callbacks.onSuccess?.(result);
    },
    onPending: (result) => {
      console.log("Pembayaran pending:", result);
      callbacks.onPending?.(result);
    },
    onError: (result) => {
      console.error("Pembayaran gagal:", result);
      callbacks.onError?.(result);
    },
    onClose: () => {
      console.log("Popup ditutup");
      callbacks.onClose?.();
    },
  });
}

export async function checkStatusMidtrans(orderId: string) {
  const { data } = await api.get(`/midtrans/status/${orderId}`);
  return data;
}
