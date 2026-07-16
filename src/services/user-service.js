import api, { unwrap } from "../lib/axios";

export const getUsers = async (params = {}) =>
  unwrap(await api.get("/users", { params }));

export const toggleUserActive = async (id) =>
  unwrap(await api.patch(`/users/${id}/toggle-active`));

export const updateUserRole = async (id, role) =>
  unwrap(await api.patch(`/users/${id}/role`, { role }));

export const deleteUser = async (id) => unwrap(await api.delete(`/users/${id}`));
