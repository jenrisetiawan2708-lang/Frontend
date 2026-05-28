import api from "./axios";

export async function getTagihan() {
  const { data } = await api.get("/tagihan");
  return data;
}

export async function getTagihanDetail(id: number) {
  const { data } = await api.get(`/tagihan/${id}`);
  return data;
}

export async function buatTagihan(payload: {
  id_sewa: number;
  bulan: string;
  jumlah: number;
  denda?: number;
}) {
  const { data } = await api.post("/tagihan", payload);
  return data;
}

export async function generateTagihanBulanan(bulan: string) {
  const { data } = await api.post("/tagihan/generate-bulanan", { bulan });
  return data;
}

export async function updateDenda(id: number, denda: number) {
  const { data } = await api.put(`/tagihan/${id}/denda`, { denda });
  return data;
}

export async function getTagihanSummary() {
  const { data } = await api.get("/tagihan/summary");
  return data;
}
