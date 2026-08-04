import api, { unwrap } from "../lib/axios";

// Voucher chỉ quản trị mới thao tác -> dùng /admin/vouchers

export const getVouchers = async () =>
  unwrap(await api.get("/admin/vouchers"));

export const createVoucher = async (data) =>
  unwrap(await api.post("/admin/vouchers", data));

export const updateVoucher = async (id, data) =>
  unwrap(await api.put(`/admin/vouchers/${id}`, data));

// API không có /hide và /active riêng, chỉ có một endpoint tự đảo trạng thái
// active <-> inactive, không cần gửi body.
export const toggleVoucherStatus = async (id) =>
  unwrap(await api.patch(`/admin/vouchers/${id}/status`));

// Voucher xoá hẳn được (khác brand/category) vì đơn hàng chỉ lưu số tiền
// giảm, không tham chiếu tới _id của voucher.
export const deleteVoucher = async (id) =>
  unwrap(await api.delete(`/admin/vouchers/${id}`));
