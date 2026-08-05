import api, { unwrap } from "../lib/axios";

// API mới chỉ có 2 route đọc, đều yêu cầu token + quyền admin:
//   GET /admin/users       -> danh sách (đã bỏ trường password)
//   GET /admin/users/:id   -> chi tiết
export const getUsers = async () => unwrap(await api.get("/admin/users"));

export const getUserById = async (id) =>
  unwrap(await api.get(`/admin/users/${id}`));

// Khoá tài khoản, đổi vai trò và xoá người dùng: API chưa có endpoint tương ứng.
// Khi backend bổ sung thì khai báo lại ở đây và mở nút trong Users.jsx.
