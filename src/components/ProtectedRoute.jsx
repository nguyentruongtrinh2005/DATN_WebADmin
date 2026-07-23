import { Navigate } from "react-router-dom";
import { Result, Button } from "antd";
import { useAuthStore } from "../store/useAuthStore";

// Chặn truy cập theo vai trò. allowedRoles mặc định: staff + admin
const ProtectedRoute = ({ children, allowedRoles = ["staff", "admin"] }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này"
        extra={
          <Button type="primary" href="/dashboard">
            Về trang thống kê
          </Button>
        }
      />
    );
  }

  return children;
};

export default ProtectedRoute;
