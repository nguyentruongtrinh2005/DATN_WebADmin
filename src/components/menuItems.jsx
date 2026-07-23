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
export const menuItems = [
  { key: "/dashboard", icon: <BarChartOutlined />, label: "Thống kê", roles: ["staff", "admin"] },
  { key: "/categories", icon: <AppstoreOutlined />, label: "Quản lý danh mục", roles: ["staff", "admin"] },
  { key: "/brands", icon: <TagsOutlined />, label: "Quản lý thương hiệu", roles: ["staff", "admin"] },
  { key: "/products", icon: <DropboxOutlined />, label: "Quản lý sản phẩm", roles: ["staff", "admin"] },
  { key: "/orders", icon: <OrderedListOutlined />, label: "Quản lý đơn hàng", roles: ["staff", "admin"] },
  { key: "/vouchers", icon: <GiftOutlined />, label: "Quản lý voucher", roles: ["staff", "admin"] },
  { key: "/reviews", icon: <CommentOutlined />, label: "Đánh giá & Bình luận", roles: ["staff", "admin"] },
  { key: "/chat", icon: <MessageOutlined />, label: "Chat khách hàng", roles: ["staff", "admin"] },
  { key: "/users", icon: <UserOutlined />, label: "Quản lý người dùng", roles: ["admin"] },
  { key: "/banners", icon: <PictureOutlined />, label: "Banner & Quảng cáo", roles: ["admin"] },
  { key: "/notifications", icon: <BellOutlined />, label: "Thông báo hệ thống", roles: ["admin"] },
  { key: "/payment-methods", icon: <CreditCardOutlined />, label: "Phương thức thanh toán", roles: ["admin"] },
  { key: "/shipping-providers", icon: <CarOutlined />, label: "Đơn vị vận chuyển", roles: ["admin"] },
  { key: "/complaints", icon: <ExclamationCircleOutlined />, label: "Khiếu nại", roles: ["admin"] },
];
