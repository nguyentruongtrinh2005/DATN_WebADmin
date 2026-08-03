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

// API biến thể bắt buộc colorName + colorCode dạng HEX #RRGGBB,
// nên mỗi màu phải đi kèm mã. Cùng một tên màu phải luôn cùng một mã,
// nếu không API trả "Tên màu đã tồn tại với mã màu khác".
export const COLOR_OPTIONS = [
  { name: "Đen", code: "#000000" },
  { name: "Trắng", code: "#FFFFFF" },
  { name: "Xám", code: "#808080" },
  { name: "Đỏ", code: "#E53935" },
  { name: "Xanh dương", code: "#1E88E5" },
  { name: "Xanh lá", code: "#43A047" },
  { name: "Vàng", code: "#FDD835" },
  { name: "Cam", code: "#FB8C00" },
  { name: "Hồng", code: "#EC407A" },
  { name: "Tím", code: "#8E24AA" },
  { name: "Nâu", code: "#6D4C41" },
  { name: "Be", code: "#D7CCC8" },
];

export const getColorCode = (name) =>
  COLOR_OPTIONS.find((c) => c.name === name)?.code || "#000000";

// Size giày phổ thông
export const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
