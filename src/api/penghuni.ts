import api from "./axios";

export async function getDaftarPenghuni(search?: string) {
  const params = search ? { search } : {};
  const { data } = await api.get("/penghuni", { params });
  return data;
}

export async function getPenghuniDetail(id: number) {
  const { data } = await api.get(`/penghuni/${id}`);
  return data;
}

export async function getMyProfile() {
  const { data } = await api.get("/penghuni/me");
  return data;
}

export async function tambahPenghuni(payload: {
  nama: string;
  email: string;
  username: string;
  password: string;
  id_kamar: number;
  tanggal_masuk: string;
}) {
  const { data } = await api.post("/penghuni", payload);
  return data;
}

export async function updatePenghuni(id: number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/penghuni/${id}`, payload);
  return data;
}

export async function hapusPenghuni(id: number) {
  const { data } = await api.delete(`/penghuni/${id}`);
  return data;
}
