import api, { unwrap } from "../lib/axios";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return unwrap(res); // { token, user }
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return unwrap(res);
};
