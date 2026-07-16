import api, { unwrap } from "../lib/axios";

export const getBrands = async () => unwrap(await api.get("/brands"));

export const createBrand = async (data) => unwrap(await api.post("/brands", data));

export const updateBrand = async (id, data) =>
  unwrap(await api.put(`/brands/${id}`, data));

export const deleteBrand = async (id) =>
  unwrap(await api.delete(`/brands/${id}`));
