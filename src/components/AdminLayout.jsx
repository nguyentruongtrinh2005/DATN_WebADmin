import { useState } from "react";
import { Layout, Menu, Typography } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { menuItems } from "./menuItems.jsx";
import HeaderComponent from "./HeaderComponent.jsx";
import { useAuthStore } from "../store/useAuthStore";

const { Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Màn hình hẹp hơn 992px — do Sider báo về qua onBreakpoint.
  const [isNarrow, setIsNarrow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Chỉ hiện menu đúng vai trò.
  // Mục đang phát triển vẫn hiện, chỉ làm mờ và ghi chú để khỏi bấm nhầm.
  const visibleItems = menuItems
    .filter((item) => !item.hidden && item.roles.includes(user?.role))
    .map(({ key, icon, label, wip }) => ({
      key,
      icon,
      label: wip ? (
        <span style={{ opacity: 0.65 }}>
          {label}
          <span style={{ fontSize: 11, marginLeft: 6 }}>(đang phát triển)</span>
        </span>
      ) : (
        label
      ),
    }));

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    "/dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={250}
        // Máy tính: thu lại còn dải 80px vẫn thấy biểu tượng.
        // Dưới 992px: ẩn hẳn, vì 80px trên điện thoại là ăn mất chỗ của nội dung.
        breakpoint="lg"
        collapsedWidth={isNarrow ? 0 : 80}
        onBreakpoint={(broken) => {
          setIsNarrow(broken);
          setCollapsed(broken);
        }}
        zeroWidthTriggerStyle={{ top: 12 }}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: collapsed ? "15px 0" : "25px 0",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 10,
          }}
        >
          <Text
            strong
            style={{
              color: "#fff",
              fontSize: collapsed ? 16 : 24,
              textTransform: "uppercase",
            }}
          >
            {collapsed ? "RY" : "RYDE"}
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? (isNarrow ? 0 : 80) : 250,
        }}
      >
        <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content style={{ margin: "80px 16px 16px 16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
