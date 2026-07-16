import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Switch,
  Popconfirm,
  Avatar,
  message,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  getUsers,
  toggleUserActive,
  updateUserRole,
  deleteUser,
} from "../services/user-service";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";
import { useAuthStore } from "../store/useAuthStore";

const { Title } = Typography;

const ROLE_OPTIONS = [
  { value: "user", label: "Khách hàng" },
  { value: "staff", label: "Nhân viên" },
  { value: "admin", label: "Admin" },
];

const ROLE_COLORS = { admin: "red", staff: "blue", user: "green" };

const Users = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (roleFilter) params.role = roleFilter;
      setUsers(await getUsers(params));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const doAction = async (fn, successMsg) => {
    try {
      await fn();
      if (successMsg) message.success(successMsg);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar || undefined} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.fullName}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    { title: "SĐT", dataIndex: "phone", key: "phone", width: 120 },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 160,
      render: (role, record) =>
        record._id === currentUser?.id ? (
          <Tag color={ROLE_COLORS[role]}>
            {ROLE_OPTIONS.find((r) => r.value === role)?.label} (bạn)
          </Tag>
        ) : (
          <Select
            value={role}
            size="small"
            style={{ width: 130 }}
            options={ROLE_OPTIONS}
            onChange={(newRole) =>
              doAction(() => updateUserRole(record._id, newRole), "Đã đổi vai trò")
            }
          />
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 140,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          checkedChildren="Hoạt động"
          unCheckedChildren="Đã khóa"
          disabled={record._id === currentUser?.id}
          onChange={() => doAction(() => toggleUserActive(record._id))}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d) => formatDate(d),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) =>
        record._id !== currentUser?.id && (
          <Popconfirm
            title="Xóa tài khoản này?"
            description="Hành động không thể hoàn tác!"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => doAction(() => deleteUser(record._id), "Đã xóa tài khoản")}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Quản lý người dùng
        </Title>
        <Select
          placeholder="Lọc vai trò"
          style={{ width: 150 }}
          allowClear
          value={roleFilter || undefined}
          onChange={(v) => setRoleFilter(v || "")}
          options={ROLE_OPTIONS}
        />
      </div>

      <Input
        placeholder="Tìm theo tên hoặc email..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onPressEnter={fetchData}
        allowClear
        style={{ marginBottom: 16 }}
      />

      <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />
    </Card>
  );
};

export default Users;
