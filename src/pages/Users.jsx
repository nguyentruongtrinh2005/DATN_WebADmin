import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Input,
  Select,
  Avatar,
  Row,
  Col,
  Statistic,
  Alert,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { getUsers } from "../services/user-service";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";
import { useAuthStore } from "../store/useAuthStore";

const { Title } = Typography;

// Model User chỉ có 2 vai trò: "user" và "admin" (chưa có "staff")
const ROLE_LABELS = { user: "Khách hàng", admin: "Admin" };
const ROLE_COLORS = { admin: "red", user: "green" };

const Users = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setUsers(await getUsers());
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      locked: users.filter((u) => u.isActive === false).length,
    }),
    [users]
  );

  // API trả về toàn bộ danh sách, không nhận tham số lọc -> lọc tại đây
  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;

    if (searchText) {
      const keyword = searchText.toLowerCase();
      const haystack = [u.fullName, u.email, u.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar || undefined} />
          <div>
            <div style={{ fontWeight: 600 }}>
              {record.fullName}
              {record._id === currentUser?.id && (
                <Tag style={{ marginLeft: 8 }}>bạn</Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#999" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (p) => p || "—",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 130,
      align: "center",
      render: (role) => (
        <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role] || role}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      align: "center",
      render: (isActive) =>
        isActive === false ? (
          <Tag color="red">Đã khóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (d) => formatDate(d),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        Quản lý người dùng
      </Title>


      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng tài khoản"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Quản trị viên"
              value={stats.admin}
              prefix={<CrownOutlined style={{ color: "#f5222d" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Đang bị khóa"
              value={stats.locked}
              valueStyle={{ color: stats.locked > 0 ? "#f5222d" : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={14}>
          <Input
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            placeholder="Lọc vai trò"
            style={{ width: "100%" }}
            allowClear
            value={roleFilter}
            onChange={(v) => setRoleFilter(v ?? null)}
            options={[
              { value: "user", label: "Khách hàng" },
              { value: "admin", label: "Admin" },
            ]}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "Chưa có tài khoản nào" }}
      />
    </Card>
  );
};

export default Users;
