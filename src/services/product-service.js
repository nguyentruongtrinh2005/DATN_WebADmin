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

// Đổi trạng thái theo giá trị mong muốn — dùng cho công tắc trên giao diện
export const setProductStatus = async (id, status) =>
  status === "active" ? activeProduct(id) : hideProduct(id);

// Biến thể (size / màu / tồn kho)
//
// API admin không có route lấy biến thể theo sản phẩm. Route công khai
// /product-variants/product/:id thì chỉ trả biến thể active và còn 404 nếu
// sản phẩm đang ẩn -> trang quản trị không dùng được.
// Nên lấy toàn bộ từ /admin/product-variants rồi lọc tại đây.
export const getVariantsByProduct = async (productId) => {
  const all = await unwrap(await api.get("/admin/product-variants"));

  return all.filter((v) => {
    // product đã được populate thành object, phòng trường hợp trả về id thô
    const id = v.product?._id || v.product;
    return String(id) === String(productId);
  });
};

export const createVariant = async (data) =>
  unwrap(await api.post("/admin/product-variants", data));

export const updateVariant = async (id, data) =>
  unwrap(await api.put(`/admin/product-variants/${id}`, data));

// DELETE ở API biến thể thực chất là ẩn (status -> inactive)
export const deleteVariant = async (id) =>
  unwrap(await api.delete(`/admin/product-variants/${id}`));

export const restoreVariant = async (id) =>
  unwrap(await api.patch(`/admin/product-variants/${id}/restore`));

// API chưa có route POST /upload (và chưa cài multer) nên không upload file được.
// Trang Sản phẩm và Thương hiệu đã chuyển sang nhập ảnh bằng link.
// Giữ hàm này cho trang Banners còn import — báo lỗi rõ ràng thay vì 404 khó hiểu.
export const uploadImage = async () => {
  throw new Error(
    "API chưa hỗ trợ tải ảnh lên. Hãy dùng link ảnh (https://...) thay cho việc chọn file."
  );
};
