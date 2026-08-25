import {
  BarChartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  DropboxOutlined,
  OrderedListOutlined,
  CommentOutlined,
  MessageOutlined,
  UserOutlined,
  PictureOutlined,
  BellOutlined,
  CreditCardOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
} from "@ant-design/icons";

// roles: các vai trò được thấy mục menu này
// wip:   true = API chưa có, trang chỉ hiện khung "Đang phát triển".
//        Backend làm xong thì bỏ cờ này đi (và bỏ early-return trong file trang).
// hidden: true = ẩn khỏi menu. Route và code của trang vẫn giữ nguyên,
//        bỏ cờ này là mục hiện lại ngay.
export const menuItems = [
  { key: "/dashboard", icon: <BarChartOutlined />, label: "Thống kê", roles: ["staff", "admin"] },
  { key: "/categories", icon: <AppstoreOutlined />, label: "Quản lý danh mục", roles: ["staff", "admin"] },
  { key: "/brands", icon: <TagsOutlined />, label: "Quản lý thương hiệu", roles: ["staff", "admin"] },
  { key: "/products", icon: <DropboxOutlined />, label: "Quản lý sản phẩm", roles: ["staff", "admin"] },
  { key: "/orders", icon: <OrderedListOutlined />, label: "Quản lý đơn hàng", roles: ["staff", "admin"] },
  { key: "/vouchers", icon: <GiftOutlined />, label: "Quản lý voucher", roles: ["staff", "admin"] },
  { key: "/reviews", icon: <CommentOutlined />, label: "Đánh giá & Bình luận", roles: ["staff", "admin"] },
  { key: "/users", icon: <UserOutlined />, label: "Quản lý khách hàng", roles: ["admin"] },
  { key: "/payment-methods", icon: <CreditCardOutlined />, label: "Phương thức thanh toán", roles: ["admin"] },

  // ==========================================================
  // ĐANG ẨN — API chưa có, chỉ ẩn khỏi menu chứ không xoá.
  // Bỏ hidden là mục hiện lại ngay, route và code trang vẫn nguyên vẹn.
  // ==========================================================

  // App dùng ảnh banner cứng trong assets, không gọi API bao giờ
  { key: "/banners", icon: <PictureOutlined />, label: "Banner & Quảng cáo", roles: ["admin"], hidden: true, wip: true },

  // Chưa có model hội thoại/tin nhắn, app cũng chưa có màn hình chat
  { key: "/chat", icon: <MessageOutlined />, label: "Chat khách hàng", roles: ["staff", "admin"], hidden: true, wip: true },

  // Model Notification bắt buộc gắn với 1 đơn hàng, chưa gửi thông báo chung được
  { key: "/notifications", icon: <BellOutlined />, label: "Thông báo hệ thống", roles: ["admin"], hidden: true, wip: true },

  // Order chỉ có shippingFee, không lưu hãng vận chuyển hay mã vận đơn
  { key: "/shipping-providers", icon: <CarOutlined />, label: "Đơn vị vận chuyển", roles: ["admin"], hidden: true, wip: true },

  // Chưa có model khiếu nại và route tương ứng
  { key: "/complaints", icon: <ExclamationCircleOutlined />, label: "Khiếu nại", roles: ["admin"], hidden: true, wip: true },
];
