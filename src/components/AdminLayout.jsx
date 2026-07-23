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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Chỉ hiện menu đúng vai trò
  const visibleItems = menuItems
    .filter((item) => item.roles.includes(user?.role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

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
            {collapsed ? "SU" : "StepUp"}
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
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
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
