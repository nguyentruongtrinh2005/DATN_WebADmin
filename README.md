# RYDE Admin — Web quản trị bán giày thể thao

Web quản trị cho hệ thống bán giày thể thao RYDE (đồ án tốt nghiệp).

## Nhóm thực hiện

| Thành viên | Phụ trách |
|---|---|
| **Nguyễn Trường Trinh** | Đăng nhập & phân quyền, layout quản trị, thống kê, đơn hàng, sản phẩm & biến thể, voucher |
| **Nguyễn Duy Long** | Thương hiệu, danh mục, người dùng, đánh giá & kiểm duyệt, chat, banner, thông báo, thanh toán, vận chuyển, khiếu nại |

## Công nghệ

- **React 18** + **Vite**
- **Ant Design** — giao diện quản trị
- **React Router 7** — điều hướng
- **Zustand** — lưu trạng thái đăng nhập
- **Axios** — gọi API
- **Recharts** — biểu đồ thống kê

## Chạy trên máy

```bash
npm install
cp .env.example .env    # Windows: copy .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

### Cấu hình `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_STATIC_URL=http://localhost:3000
```

Sửa 2 dòng này nếu API chạy ở địa chỉ khác (máy khác trong LAN, hoặc server đã deploy).
Sau khi sửa phải **khởi động lại** `npm run dev` — Vite chỉ đọc `.env` lúc chạy.

> Cần API (ShoeStore API) chạy trước, mặc định ở cổng 3000.

## Chức năng

- **Thống kê** — doanh thu theo ngày/tháng/năm, sản phẩm bán chạy, đơn hàng gần đây
- **Đơn hàng** — lọc theo trạng thái/ngày/khách, đổi trạng thái theo luồng, hoàn tiền, in hoá đơn
- **Sản phẩm** — CRUD, biến thể (màu/size/tồn kho), upload ảnh, xem chi tiết
- **Voucher** — mã giảm giá theo % hoặc số tiền, giới hạn lượt dùng, thời gian hiệu lực
- **Thương hiệu / Danh mục** — CRUD kèm ẩn/hiện
- **Người dùng** — khoá/mở, đổi vai trò
- **Đánh giá** — duyệt/từ chối, trả lời, cảnh báo nội dung xấu
- **Chat, Banner, Thông báo, Thanh toán, Vận chuyển, Khiếu nại**

## Tài khoản dùng thử

Chạy `npm run seed` ở project API để tạo sẵn:

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `admin@ryde.vn` | `admin123` | admin |

> Nhớ đổi mật khẩu này trước khi deploy thật.

## Build

```bash
npm run build
```

Kết quả nằm trong thư mục `dist/`.
