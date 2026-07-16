import api, { unwrap } from "../lib/axios";

export const getCategories = async () => unwrap(await api.get("/categories"));

export const createCategory = async (data) =>
  unwrap(await api.post("/categories", data));

export const updateCategory = async (id, data) =>
  unwrap(await api.put(`/categories/${id}`, data));

export const deleteCategory = async (id) =>
  unwrap(await api.delete(`/categories/${id}`));
