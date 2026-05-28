import api from "./axios";

export async function getPembayaran() {
  const { data } = await api.get("/pembayaran");
  return data;
}

// Upload bukti pembayaran manual (multipart/form-data)
export async function uploadBuktiPembayaran(payload: {
  id_tagihan: number;
  jumlah_bayar: number;
  bukti: File;
  tanggal_pembayaran: string;
}) {
  const form = new FormData();
  form.append("id_tagihan", String(payload.id_tagihan));
  form.append("jumlah_bayar", String(payload.jumlah_bayar));
  form.append("bukti", payload.bukti);
  form.append("tanggal_pembayaran", payload.tanggal_pembayaran);

  const { data } = await api.post("/pembayaran", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function validasiPembayaran(id: number, status: "Valid" | "Ditolak", catatan?: string) {
  const { data } = await api.put(`/pembayaran/${id}/validasi`, { status, catatan });
  return data;
}

export async function getPembayaranMenunggu() {
  const { data } = await api.get("/pembayaran/menunggu");
  return data;
}
