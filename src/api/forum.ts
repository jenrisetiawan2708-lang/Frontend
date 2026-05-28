import api from "./axios";

export async function getForum() {
  const { data } = await api.get("/forum");
  return data;
}

export async function kirimPesan(isi_pesan: string, parent_id?: number) {
  const { data } = await api.post("/forum", { isi_pesan, parent_id });
  return data;
}

export async function hapusPesan(id: number) {
  const { data } = await api.delete(`/forum/${id}`);
  return data;
}
