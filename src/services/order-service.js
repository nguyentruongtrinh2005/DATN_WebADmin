import api, { unwrap } from "../lib/axios";

// /orders là endpoint của khách (đặt hàng, xem đơn của mình).
// Trang quản trị dùng /admin/orders — xem được mọi đơn và có quyền đổi trạng thái.

// params: { search, status, from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
export const getOrders = async (params = {}) =>
  unwrap(await api.get("/admin/orders", { params }));

export const getOrderById = async (id) =>
  unwrap(await api.get(`/admin/orders/${id}`));

export const updateOrderStatus = async (id, status, note) =>
  unwrap(await api.patch(`/admin/orders/${id}/status`, { status, note }));

// Chỉ hoàn tiền được cho đơn đã huỷ
export const refundOrder = async (id, data = {}) =>
  unwrap(await api.patch(`/admin/orders/${id}/refund`, data));
