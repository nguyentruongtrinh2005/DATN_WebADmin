import { create } from "zustand";

// Nhớ lựa chọn sáng/tối giữa các lần mở trang.
// Lần đầu vào thì theo cài đặt của hệ điều hành, để khỏi chói mắt người
// đang dùng máy ở chế độ tối.
const getStoredMode = () => {
  try {
    const saved = localStorage.getItem("theme_mode");

    if (saved === "light" || saved === "dark") {
      return saved;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export const useThemeStore = create((set) => ({
  mode: getStoredMode(),

  toggleMode: () =>
    set((state) => {
      const next = state.mode === "dark" ? "light" : "dark";

      try {
        localStorage.setItem("theme_mode", next);
      } catch {
        // Trình duyệt chặn localStorage thì vẫn đổi được, chỉ là không nhớ.
      }

      return { mode: next };
    }),
}));
