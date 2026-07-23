import api, { unwrap } from "../lib/axios";

export const getUsers = async (params = {}) =>
  unwrap(await api.get("/admin/users", { params }));

export const toggleUserActive = async (id) =>
  unwrap(await api.patch(`/admin/users/${id}/toggle-active`));

export const updateUserRole = async (id, role) =>
  unwrap(await api.patch(`/admin/users/${id}/role`, { role }));

export const deleteUser = async (id) => unwrap(await api.delete(`/admin/users/${id}`));
