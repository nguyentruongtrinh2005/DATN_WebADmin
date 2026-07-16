import api, { unwrap } from "../lib/axios";

export const getConversations = async () =>
  unwrap(await api.get("/chat/conversations"));

export const getMessages = async (conversationId) =>
  unwrap(await api.get(`/chat/conversations/${conversationId}/messages`));

export const sendMessage = async (conversationId, content) =>
  unwrap(await api.post(`/chat/conversations/${conversationId}/messages`, { content }));
