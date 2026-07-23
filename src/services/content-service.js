import api, { unwrap } from "../lib/axios";

// Banner & quảng cáo
export const getBanners = async (params = {}) =>
  unwrap(await api.get("/admin/banners", { params }));

export const createBanner = async (data) => unwrap(await api.post("/admin/banners", data));

export const updateBanner = async (id, data) =>
  unwrap(await api.put(`/admin/banners/${id}`, data));

export const deleteBanner = async (id) =>
  unwrap(await api.delete(`/admin/banners/${id}`));

// Thông báo hệ thống
export const getNotifications = async () => unwrap(await api.get("/admin/notifications"));

export const createNotification = async (data) =>
  unwrap(await api.post("/admin/notifications", data));

export const updateNotification = async (id, data) =>
  unwrap(await api.put(`/admin/notifications/${id}`, data));

export const deleteNotification = async (id) =>
  unwrap(await api.delete(`/admin/notifications/${id}`));
