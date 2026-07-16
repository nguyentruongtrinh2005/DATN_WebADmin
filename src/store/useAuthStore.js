import { create } from "zustand";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("access_token") || null,

  setAuth: ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("access_token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    set({ user: null, token: null });
  },
}));
