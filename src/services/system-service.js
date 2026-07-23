import api, { unwrap } from "../lib/axios";

// Phương thức thanh toán
export const getPaymentMethods = async () =>
  unwrap(await api.get("/admin/payment-methods"));

export const createPaymentMethod = async (data) =>
  unwrap(await api.post("/admin/payment-methods", data));

export const updatePaymentMethod = async (id, data) =>
  unwrap(await api.put(`/admin/payment-methods/${id}`, data));

export const deletePaymentMethod = async (id) =>
  unwrap(await api.delete(`/admin/payment-methods/${id}`));

// Đơn vị vận chuyển
export const getShippingProviders = async () =>
  unwrap(await api.get("/admin/shipping-providers"));

export const createShippingProvider = async (data) =>
  unwrap(await api.post("/admin/shipping-providers", data));

export const updateShippingProvider = async (id, data) =>
  unwrap(await api.put(`/admin/shipping-providers/${id}`, data));

export const deleteShippingProvider = async (id) =>
  unwrap(await api.delete(`/admin/shipping-providers/${id}`));

// Khiếu nại
export const getComplaints = async (params = {}) =>
  unwrap(await api.get("/admin/complaints", { params }));

export const getComplaintById = async (id) =>
  unwrap(await api.get(`/admin/complaints/${id}`));

export const updateComplaint = async (id, data) =>
  unwrap(await api.patch(`/admin/complaints/${id}`, data));
