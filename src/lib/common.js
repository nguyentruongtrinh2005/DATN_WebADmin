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

// Nhãn tiếng Việt cho trạng thái đơn hàng.
// Phải khớp đúng enum của API (models/Order.js):
// pending | confirmed | shipping | delivered | cancelled
// Trước đây web dùng "completed" và "refunded" -> API trả 400 "Trạng thái không hợp lệ".
export const ORDER_STATUS_LABELS = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_COLORS = {
  pending: "orange",
  confirmed: "blue",
  shipping: "cyan",
  delivered: "green",
  cancelled: "red",
};

// Thứ tự các bước của một đơn hàng bình thường
export const ORDER_STATUS_FLOW = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
];

// Nhãn cho trạng thái thanh toán
export const PAYMENT_STATUS_LABELS = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán lỗi",
};

export const PAYMENT_STATUS_COLORS = {
  pending: "orange",
  paid: "green",
  failed: "red",
};

// API biến thể bắt buộc colorName + colorCode dạng HEX #RRGGBB.
// Cùng một tên màu phải luôn cùng một mã, nếu không API trả
// "Tên màu đã tồn tại với mã màu khác".
// Danh sách dưới đây chỉ là gợi ý bấm nhanh, admin vẫn tự đặt màu và tên tuỳ ý.
export const COLOR_PRESETS = [
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

// Đưa mọi kiểu nhập về đúng dạng API cần: #RRGGBB viết hoa.
// Chấp nhận "#abc", "abcdef", "#AABBCCDD" (bỏ kênh alpha). Sai thì trả null.
export const normalizeHex = (value) => {
  if (!value) return null;

  let hex = String(value).trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // ColorPicker có thể trả kèm alpha (8 ký tự), API chỉ nhận 6
  if (/^[0-9a-fA-F]{8}$/.test(hex)) {
    hex = hex.slice(0, 6);
  }

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  return `#${hex.toUpperCase()}`;
};

// Chọn màu chữ đen hay trắng để đọc được trên nền màu đã cho
export const contrastText = (hexColor) => {
  const hex = normalizeHex(hexColor) || "#000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Công thức độ sáng cảm nhận (YIQ)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000000" : "#FFFFFF";
};

// Size giày phổ thông
export const SIZE_OPTIONS = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
