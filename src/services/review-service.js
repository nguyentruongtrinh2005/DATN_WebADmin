import api, { unwrap } from "../lib/axios";

export const getReviews = async (params = {}) =>
  unwrap(await api.get("/reviews", { params }));

export const replyReview = async (id, content) =>
  unwrap(await api.patch(`/reviews/${id}/reply`, { content }));

export const moderateReview = async (id, status) =>
  unwrap(await api.patch(`/reviews/${id}/moderate`, { status }));

export const recheckReview = async (id) =>
  unwrap(await api.post(`/reviews/${id}/recheck`));

export const deleteReview = async (id) =>
  unwrap(await api.delete(`/reviews/${id}`));
