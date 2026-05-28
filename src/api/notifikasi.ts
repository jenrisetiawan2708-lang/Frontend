import api from "./axios";

export async function getNotifikasi() {
  const { data } = await api.get("/notifikasi");
  return data;
}

export async function tandaiBaca(id: number) {
  const { data } = await api.put(`/notifikasi/${id}/baca`);
  return data;
}

export async function tandaiSemuaBaca() {
  const { data } = await api.put("/notifikasi/baca-semua");
  return data;
}
