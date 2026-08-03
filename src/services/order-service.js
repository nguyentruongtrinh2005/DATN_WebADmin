import api, { unwrap } from "../lib/axios";

// /orders là endpoint của khách (đặt hàng, xem đơn của mình).
// Trang quản trị dùng /admin/orders — xem được mọi đơn và có quyền đổi trạng thái.

// API chưa hỗ trợ lọc bằng query (getAdminOrdersService trả về toàn bộ đơn),
// nên lấy hết rồi lọc tại trang Orders.jsx.
export const getOrders = async () => unwrap(await api.get("/admin/orders"));

export const getOrderById = async (id) =>
  unwrap(await api.get(`/admin/orders/${id}`));

// API dùng PUT /admin/orders/:id/status và chỉ nhận { status }.
// Trước đây web gọi PATCH -> 404. Trường note API chưa lưu nên không gửi.
// Trả về { order, notification } — chỉ lấy phần order.
export const updateOrderStatus = async (id, status) => {
  const data = await unwrap(await api.put(`/admin/orders/${id}/status`, { status }));

  return data?.order || data;
};

// API chưa có chức năng hoàn tiền (không có route /refund, enum status cũng
// không có "refunded"). Khi nào backend làm xong thì bật lại ở OrderDetail.jsx.
