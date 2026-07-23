import api, { unwrap } from "../lib/axios";

// Xem ghi chú ở brand-service: trang quản trị phải dùng /admin/... để thấy
// được cả mục đã ẩn và để có quyền ghi.

export const getCategories = async () =>
  unwrap(await api.get("/admin/categories"));

export const createCategory = async (data) =>
  unwrap(await api.post("/admin/categories", data));

export const updateCategory = async (id, data) =>
  unwrap(await api.put(`/admin/categories/${id}`, data));

// API chỉ ẩn, không xoá hẳn danh mục.
export const hideCategory = async (id) =>
  unwrap(await api.patch(`/admin/categories/${id}/hide`));

export const activeCategory = async (id) =>
  unwrap(await api.patch(`/admin/categories/${id}/active`));

export const deleteCategory = hideCategory;
