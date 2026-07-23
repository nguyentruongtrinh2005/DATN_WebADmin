import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Tag, Typography, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const { Text } = Typography;

const ROLE_LABELS = {
  admin: { label: "Admin", color: "red" },
  staff: { label: "Nhân viên", color: "blue" },
};

const HeaderComponent = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất?",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: () => {
        logout();
        navigate("/login");
      },
    });
  };

  const menuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const roleInfo = ROLE_LABELS[user?.role] || { label: user?.role, color: "default" };

  return (
    <header
      style={{
        background: "#fff",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: collapsed ? 80 : 250,
        right: 0,
        zIndex: 1001,
        height: "64px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        transition: "left 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
        <Text strong style={{ fontSize: 18 }}>
          Xin chào: {user?.fullName || "Quản trị viên"}
        </Text>
        <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
      </div>

      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Space style={{ cursor: "pointer", padding: "4px 12px" }}>
          <Avatar size={32} src={user?.avatar || undefined} icon={<UserOutlined />} />
          <Text>{user?.email}</Text>
          <DownOutlined style={{ fontSize: 12 }} />
        </Space>
      </Dropdown>
    </header>
  );
};

export default HeaderComponent;
