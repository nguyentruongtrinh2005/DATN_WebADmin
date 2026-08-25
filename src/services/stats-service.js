import dayjs from "dayjs";
import api, { unwrap } from "../lib/axios";

// API chưa có nhóm /admin/stats/* (dashboard, revenue, top-products,
// recent-orders đều 404). Nên trang Thống kê tự tính từ 3 endpoint có sẵn:
// /admin/orders, /admin/products, /admin/product-variants.
//
// Khi backend làm xong /admin/stats, chỉ cần thay getStatsSource + các hàm
// build* bên dưới bằng lời gọi API tương ứng, Dashboard.jsx không phải sửa.

// Chỉ đơn ĐÃ GIAO mới tính vào doanh thu.
// Đơn đang xử lý chưa chắc tới tay khách (có thể huỷ giữa chừng, hoàn hàng),
// tính vào doanh thu sẽ báo số ảo.
const isRevenueOrder = (order) => order.status === "delivered";

export const getStatsSource = async () => {
  const [orders, products, variants] = await Promise.all([
    unwrap(await api.get("/admin/orders")),
    unwrap(await api.get("/admin/products")),
    unwrap(await api.get("/admin/product-variants")),
  ]);

  return { orders, products, variants };
};

// Bốn ô số liệu ở đầu trang
export const buildOverview = ({ orders, products, variants }) => {
  const revenueOrders = orders.filter(isRevenueOrder);

  const countStatus = (status) =>
    orders.filter((o) => o.status === status).length;

  // API chưa có /admin/users -> đếm số khách đã từng đặt hàng thay cho tổng user
  const customerIds = new Set(
    orders.map((o) => o.user?._id || o.user).filter(Boolean).map(String)
  );

  // Tiền của đơn đang trên đường — chưa tính vào doanh thu nhưng nên theo dõi
  const inProgress = orders.filter((o) =>
    ["pending", "confirmed", "shipping"].includes(o.status)
  );

  return {
    revenue: revenueOrders.reduce((sum, o) => sum + (o.total || 0), 0),

    pendingRevenue: inProgress.reduce((sum, o) => sum + (o.total || 0), 0),

    avgOrderValue: revenueOrders.length
      ? Math.round(
          revenueOrders.reduce((sum, o) => sum + (o.total || 0), 0) /
            revenueOrders.length
        )
      : 0,

    orders: {
      total: orders.length,
      pending: countStatus("pending"),
      confirmed: countStatus("confirmed"),
      shipping: countStatus("shipping"),
      delivered: countStatus("delivered"),
      cancelled: countStatus("cancelled"),
    },

    // Cho biểu đồ cột: số đơn theo từng trạng thái
    byStatus: ["pending", "confirmed", "shipping", "delivered", "cancelled"].map(
      (s) => ({ status: s, count: countStatus(s) })
    ),

    // Cho biểu đồ tròn: tỉ lệ phương thức thanh toán (không tính đơn huỷ)
    byPaymentMethod: ["cod", "vnpay"].map((m) => ({
      method: m,
      count: orders.filter(
        (o) => o.paymentMethod === m && o.status !== "cancelled"
      ).length,
    })),

    customers: customerIds.size,

    products: {
      total: products.length,
      active: products.filter((p) => p.status === "active").length,
      totalStock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
    },
  };
};

const FORMAT_BY_GROUP = {
  day: "DD/MM",
  month: "MM/YYYY",
  year: "YYYY",
};

const UNIT_BY_GROUP = {
  day: "day",
  month: "month",
  year: "year",
};

// Chuỗi doanh thu theo ngày / tháng / năm, có cả những mốc không có đơn
// để đường biểu đồ không bị đứt quãng.
export const buildRevenueSeries = (orders, groupBy, from, to) => {
  const unit = UNIT_BY_GROUP[groupBy] || "month";
  const format = FORMAT_BY_GROUP[groupBy] || "MM/YYYY";

  const buckets = new Map();

  let cursor = dayjs(from).startOf(unit);
  const end = dayjs(to).endOf(unit);

  // Chặn trên cho chắc, tránh vòng lặp quá dài khi chọn khoảng ngày rất rộng
  let guard = 0;
  while (cursor.isBefore(end) && guard < 400) {
    buckets.set(cursor.format(format), { date: cursor.format(format), revenue: 0, orders: 0 });
    cursor = cursor.add(1, unit);
    guard += 1;
  }

  orders.filter(isRevenueOrder).forEach((order) => {
    const created = dayjs(order.createdAt);

    if (created.isBefore(dayjs(from).startOf(unit))) return;
    if (created.isAfter(end)) return;

    const key = created.format(format);
    const bucket = buckets.get(key) || { date: key, revenue: 0, orders: 0 };

    bucket.revenue += order.total || 0;
    bucket.orders += 1;

    buckets.set(key, bucket);
  });

  return Array.from(buckets.values());
};

// Xếp hạng sản phẩm theo số lượng bán ra, gộp từ items của các đơn
export const buildTopProducts = (orders, limit = 5) => {
  const map = new Map();

  orders.filter(isRevenueOrder).forEach((order) => {
    (order.items || []).forEach((item) => {
      const id = String(item.product?._id || item.product || "");
      if (!id) return;

      const entry = map.get(id) || {
        productId: id,
        productName: item.product?.name || "Sản phẩm đã bị xoá",
        image: item.product?.image || "",
        totalSold: 0,
        totalRevenue: 0,
      };

      entry.totalSold += item.quantity || 0;
      entry.totalRevenue += (item.price || 0) * (item.quantity || 0);

      map.set(id, entry);
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
};

export const buildRecentOrders = (orders, limit = 5) =>
  [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
