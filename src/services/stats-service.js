import api, { unwrap } from "../lib/axios";

// Thống kê chỉ dành cho quản trị -> nằm dưới /admin/stats

export const getDashboardStats = async () =>
  unwrap(await api.get("/admin/stats/dashboard"));

// params: { groupBy: "day" | "month" | "year", from, to }
export const getRevenue = async (params = {}) =>
  unwrap(await api.get("/admin/stats/revenue", { params }));

export const getTopProducts = async (limit = 5) =>
  unwrap(await api.get("/admin/stats/top-products", { params: { limit } }));

export const getRecentOrders = async (limit = 5) =>
  unwrap(await api.get("/admin/stats/recent-orders", { params: { limit } }));
