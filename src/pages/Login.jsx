import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Typography, Card, Divider } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { login } from "../services/auth-service";
import { getErrorMessage } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text } = Typography;

const Login = () => {
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
        background: "linear-gradient(135deg, #2ecc71, #1abc9c)",
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
          <Title level={2} style={{ color: "#2ecc71", margin: 0 }}>
            StepUp Admin
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
              style={{ height: 48, backgroundColor: "#2ecc71", fontWeight: 600 }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              © {new Date().getFullYear()} StepUp. All rights reserved.
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
