import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Card,
  Divider,
  theme,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { login } from "../services/auth-service";
import { getErrorMessage } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";

const { Title, Text } = Typography;

const Login = () => {
  // Lấy màu từ theme thay vì viết cứng, để đổi màu thương hiệu ở một chỗ
  // trong main.jsx là cả trang đổi theo.
  const { token } = theme.useToken();

  const isDark = useThemeStore((state) => state.mode) === "dark";

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (values) => {
    setLoading(true);

    try {
      const { token, user } = await login(values.email, values.password);

      // Chỉ staff và admin được vào trang quản trị
      if (!["staff", "admin"].includes(user.role)) {
        message.error("Tài khoản của bạn không có quyền truy cập trang quản trị");
        return;
      }

      setAuth({ user, token });
      message.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        // Chế độ tối dùng dải xanh trầm hẳn xuống; để nguyên dải sáng thì
        // vào trang đăng nhập ban đêm là chói mắt.
        background: isDark
          ? "linear-gradient(135deg, #16233D, #0F2233)"
          : "linear-gradient(135deg, #2563EB, #0EA5E9)",
      }}
    >
      <Card
        style={{
          width: 420,
          padding: "30px 40px",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          border: "none",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title level={2} style={{ color: token.colorPrimary, margin: 0 }}>
            RYDE Admin
          </Title>
          <Text type="secondary">Quản trị hệ thống bán giày</Text>
        </div>

        <Divider />

        <Form onFinish={handleLogin} layout="vertical" size="large" requiredMark={false}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email không được để trống!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Mật khẩu không được để trống!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<LoginOutlined />}
              loading={loading}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              © {new Date().getFullYear()} RYDE. All rights reserved.
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
