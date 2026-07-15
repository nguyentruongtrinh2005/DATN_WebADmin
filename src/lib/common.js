export const formatCurrency = (value) => {
  if (typeof value === "string") value = parseFloat(value);
  if (isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Nhãn tiếng Việt cho trạng thái đơn hàng
export const ORDER_STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export const ORDER_STATUS_COLORS = {
  pending: "orange",
  confirmed: "blue",
  shipping: "cyan",
  completed: "green",
  cancelled: "red",
  refunded: "purple",
};
