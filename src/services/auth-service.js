import api, { unwrap } from "../lib/axios";

// API đã đổi nhóm route: /api/auth/... -> /api/users/...
// (authRoutes.js được đổi tên thành userRoutes.js ở phía backend)

export const login = async (email, password) => {
  const res = await api.post("/users/login", { email, password });
  return unwrap(res); // { token, user }
};

export const getProfile = async () => {
  const res = await api.get("/users/profile");
  return unwrap(res);
};
