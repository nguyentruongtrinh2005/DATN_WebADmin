import api, { unwrap } from "../lib/axios";

export const getReviews = async (params = {}) =>
  unwrap(await api.get("/admin/reviews", { params }));

export const replyReview = async (id, content) =>
  unwrap(await api.patch(`/admin/reviews/${id}/reply`, { content }));

export const moderateReview = async (id, status) =>
  unwrap(await api.patch(`/admin/reviews/${id}/moderate`, { status }));

export const recheckReview = async (id) =>
  unwrap(await api.post(`/admin/reviews/${id}/recheck`));

export const deleteReview = async (id) =>
  unwrap(await api.delete(`/admin/reviews/${id}`));
