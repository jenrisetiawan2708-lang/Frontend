import api from "./axios";

export async function getPengumuman() {
  const { data } = await api.get("/pengumuman");
  return data;
}

export async function kirimPengumuman(pesan: string) {
  const { data } = await api.post("/pengumuman", { pesan });
  return data;
}
