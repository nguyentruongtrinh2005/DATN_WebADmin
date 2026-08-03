import api, { unwrap } from "../lib/axios";

// Xem ghi chú ở brand-service: trang quản trị phải dùng /admin/... để thấy
// được cả mục đã ẩn và để có quyền ghi.

export const getCategories = async () =>
  unwrap(await api.get("/admin/categories"));

export const createCategory = async (data) =>
  unwrap(await api.post("/admin/categories", data));

export const updateCategory = async (id, data) =>
  unwrap(await api.put(`/admin/categories/${id}`, data));

// API không có DELETE danh mục — sản phẩm còn tham chiếu tới category._id,
// xoá hẳn sẽ làm hỏng sản phẩm cũ. Chỉ đổi status.
// Ẩn danh mục thì API ẩn luôn mọi sản phẩm thuộc danh mục đó.
export const hideCategory = async (id) =>
  unwrap(await api.patch(`/admin/categories/${id}/hide`));

export const activeCategory = async (id) =>
  unwrap(await api.patch(`/admin/categories/${id}/active`));

// Đổi trạng thái theo giá trị mong muốn — dùng cho công tắc trên giao diện
export const setCategoryStatus = async (id, status) =>
  status === "active" ? activeCategory(id) : hideCategory(id);
