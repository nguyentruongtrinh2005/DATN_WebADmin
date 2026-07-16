import api, { unwrap } from "../lib/axios";

// Banner & quảng cáo
export const getBanners = async (params = {}) =>
  unwrap(await api.get("/banners", { params }));

export const createBanner = async (data) => unwrap(await api.post("/banners", data));

export const updateBanner = async (id, data) =>
  unwrap(await api.put(`/banners/${id}`, data));

export const deleteBanner = async (id) =>
  unwrap(await api.delete(`/banners/${id}`));

// Thông báo hệ thống
export const getNotifications = async () => unwrap(await api.get("/notifications"));

export const createNotification = async (data) =>
  unwrap(await api.post("/notifications", data));

export const updateNotification = async (id, data) =>
  unwrap(await api.put(`/notifications/${id}`, data));

export const deleteNotification = async (id) =>
  unwrap(await api.delete(`/notifications/${id}`));
