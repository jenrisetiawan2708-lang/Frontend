import api from "./axios";

export async function getDashboardPenghuni() {
  const { data } = await api.get("/dashboard/penghuni");
  return data;
}

export async function getDashboardAdmin() {
  const { data } = await api.get("/dashboard/admin");
  return data;
}
