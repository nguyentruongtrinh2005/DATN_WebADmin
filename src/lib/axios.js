import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 401 → đăng xuất, quay về trang login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Lấy data từ response chuẩn { success, message, data }
export const unwrap = (res) => res.data.data;

// Lấy message lỗi từ API
export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Có lỗi xảy ra";

// Đổi đường dẫn ảnh tương đối (/uploads/...) thành URL đầy đủ
export const toImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  const base = import.meta.env.VITE_STATIC_URL || "http://localhost:3000";
  return `${base}${path}`;
};

export default api;
