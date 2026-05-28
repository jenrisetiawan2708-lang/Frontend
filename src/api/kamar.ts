import api from "./axios";

export async function getDaftarKamar(status?: "kosong" | "terisi") {
  const params = status ? { status } : {};
  const { data } = await api.get("/kamar", { params });
  return data;
}

export async function getKamarSummary() {
  const { data } = await api.get("/kamar/summary");
  return data;
}

export async function getKamarDetail(id: number) {
  const { data } = await api.get(`/kamar/${id}`);
  return data;
}
