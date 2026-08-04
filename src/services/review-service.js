import api, { unwrap } from "../lib/axios";

// API chưa có nhóm /admin/reviews (trả 404). Nhưng có route công khai
// GET /reviews/product/:productId trả về mọi đánh giá của một sản phẩm,
// đã populate sẵn user. Nên lấy danh sách sản phẩm rồi gom đánh giá lại.
//
// Khi backend làm xong /admin/reviews, chỉ cần thay thân hàm getReviews.

export const getReviews = async () => {
  const products = await unwrap(await api.get("/admin/products"));

  const perProduct = await Promise.all(
    products.map(async (product) => {
      try {
        const reviews = await unwrap(
          await api.get(`/reviews/product/${product._id}`)
        );

        // Gắn kèm thông tin sản phẩm để bảng hiển thị được
        return reviews.map((review) => ({
          ...review,
          product: {
            _id: product._id,
            name: product.name,
            image: product.image,
          },
        }));
      } catch {
        // Một sản phẩm lỗi thì bỏ qua, không làm hỏng cả trang
        return [];
      }
    })
  );

  return perProduct
    .flat()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Trả lời / duyệt / xoá đánh giá: API chưa có endpoint nào, và model Review
// cũng chưa có trường status hay reply. Bổ sung backend xong mới làm được.
