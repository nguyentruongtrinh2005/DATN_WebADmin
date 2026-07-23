import api, { unwrap } from "../lib/axios";

// Voucher chỉ quản trị mới thao tác -> dùng /admin/vouchers

export const getVouchers = async () =>
  unwrap(await api.get("/admin/vouchers"));

export const createVoucher = async (data) =>
  unwrap(await api.post("/admin/vouchers", data));

export const updateVoucher = async (id, data) =>
  unwrap(await api.put(`/admin/vouchers/${id}`, data));

// API không xoá hẳn voucher (đơn cũ còn tham chiếu tới mã), chỉ ẩn.
export const hideVoucher = async (id) =>
  unwrap(await api.patch(`/admin/vouchers/${id}/hide`));

export const activeVoucher = async (id) =>
  unwrap(await api.patch(`/admin/vouchers/${id}/active`));
