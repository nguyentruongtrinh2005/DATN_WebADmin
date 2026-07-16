import api, { unwrap } from "../lib/axios";

// Phương thức thanh toán
export const getPaymentMethods = async () =>
  unwrap(await api.get("/payment-methods"));

export const createPaymentMethod = async (data) =>
  unwrap(await api.post("/payment-methods", data));

export const updatePaymentMethod = async (id, data) =>
  unwrap(await api.put(`/payment-methods/${id}`, data));

export const deletePaymentMethod = async (id) =>
  unwrap(await api.delete(`/payment-methods/${id}`));

// Đơn vị vận chuyển
export const getShippingProviders = async () =>
  unwrap(await api.get("/shipping-providers"));

export const createShippingProvider = async (data) =>
  unwrap(await api.post("/shipping-providers", data));

export const updateShippingProvider = async (id, data) =>
  unwrap(await api.put(`/shipping-providers/${id}`, data));

export const deleteShippingProvider = async (id) =>
  unwrap(await api.delete(`/shipping-providers/${id}`));

// Khiếu nại
export const getComplaints = async (params = {}) =>
  unwrap(await api.get("/complaints", { params }));

export const getComplaintById = async (id) =>
  unwrap(await api.get(`/complaints/${id}`));

export const updateComplaint = async (id, data) =>
  unwrap(await api.patch(`/complaints/${id}`, data));
