import api, { unwrap } from "../lib/axios";

// Toàn bộ dùng /admin/... để thấy được cả sản phẩm/biến thể đã ẩn
// và để có quyền ghi. Xem ghi chú ở brand-service.

export const getProducts = async () => unwrap(await api.get("/admin/products"));

// API admin dùng /admin/products/:id, không có dạng /detail/:id như bản public
export const getProductDetail = async (id) =>
  unwrap(await api.get(`/admin/products/${id}`));

export const createProduct = async (data) =>
  unwrap(await api.post("/admin/products", data));

export const updateProduct = async (id, data) =>
  unwrap(await api.put(`/admin/products/${id}`, data));

// Ẩn sản phẩm (khuyến nghị) — giữ lại dữ liệu, ẩn luôn biến thể liên quan
export const hideProduct = async (id) =>
  unwrap(await api.patch(`/admin/products/${id}/hide`));

export const activeProduct = async (id) =>
  unwrap(await api.patch(`/admin/products/${id}/active`));

// Xoá hẳn khỏi DB — không khôi phục được, chỉ dùng khi thật sự cần
export const destroyProduct = async (id) =>
  unwrap(await api.delete(`/admin/products/${id}`));

// Nút "Xóa" trên giao diện map sang ẩn, tránh mất dữ liệu do lỡ tay
export const deleteProduct = hideProduct;

// Biến thể (size / màu / tồn kho)
export const getVariantsByProduct = async (productId) =>
  unwrap(await api.get(`/admin/product-variants/product/${productId}`));

export const createVariant = async (data) =>
  unwrap(await api.post("/admin/product-variants", data));

export const updateVariant = async (id, data) =>
  unwrap(await api.put(`/admin/product-variants/${id}`, data));

// DELETE ở API biến thể thực chất là ẩn (status -> inactive)
export const deleteVariant = async (id) =>
  unwrap(await api.delete(`/admin/product-variants/${id}`));

export const restoreVariant = async (id) =>
  unwrap(await api.patch(`/admin/product-variants/${id}/restore`));

// Upload ảnh, trả về { url } dạng "/uploads/xxx.jpg"
// Không tự set Content-Type: để axios tự sinh kèm boundary của multipart,
// đặt tay sẽ thiếu boundary và multer parse hỏng.
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/upload", formData);

  return unwrap(res);
};
