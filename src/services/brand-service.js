import api, { unwrap } from "../lib/axios";

// Dùng /admin/brands chứ không phải /brands:
// - /brands (public) chỉ trả brand status = "active" -> trang quản trị sẽ
//   không thấy brand đã ẩn để bấm hiện lại.
// - /admin/brands trả tất cả, và mới có quyền thêm/sửa.

export const getBrands = async () => unwrap(await api.get("/admin/brands"));

export const createBrand = async (data) =>
  unwrap(await api.post("/admin/brands", data));

export const updateBrand = async (id, data) =>
  unwrap(await api.put(`/admin/brands/${id}`, data));

// API không xoá hẳn brand (sẽ hỏng sản phẩm đang tham chiếu tới nó),
// chỉ chuyển status sang "inactive" và ẩn luôn sản phẩm thuộc brand đó.
export const hideBrand = async (id) =>
  unwrap(await api.patch(`/admin/brands/${id}/hide`));

export const activeBrand = async (id) =>
  unwrap(await api.patch(`/admin/brands/${id}/active`));

// Giữ tên cũ cho trang đang import deleteBrand — thực chất là ẩn.
export const deleteBrand = hideBrand;
