import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Input,
  Avatar,
  Row,
  Col,
  Statistic,
  Button,
  Modal,
  Descriptions,
  Empty,
  message,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/user-service";
import { getOrders } from "../services/order-service";
import { getErrorMessage } from "../lib/axios";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from "../lib/common";

const { Title, Text } = Typography;

// Đơn hàng populate user, tùy chỗ trả về object hoặc chỉ id
const orderUserId = (order) => order.user?._id || order.user || null;

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Khách hàng đang mở xem chi tiết
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Trang này chỉ quản lý khách hàng, tài khoản admin không hiện ở đây
        const list = await getUsers();
        setUsers(list.filter((u) => u.role !== "admin"));
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    // Đơn hàng chỉ để dựng phần lịch sử mua trong ô chi tiết.
    // Lỗi ở đây không được làm hỏng danh sách khách hàng.
    const fetchOrders = async () => {
      try {
        setOrders(await getOrders());
      } catch {
        setOrders([]);
      }
    };

    fetchData();
    fetchOrders();
  }, []);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive !== false).length,
      locked: users.filter((u) => u.isActive === false).length,
    }),
    [users]
  );

  // Gom đơn theo từng khách để không phải lọc lại mỗi lần vẽ bảng
  const ordersByUser = useMemo(() => {
    const map = {};

    for (const order of orders) {
      const uid = orderUserId(order);
      if (!uid) continue;

      if (!map[uid]) map[uid] = [];
      map[uid].push(order);
    }

    return map;
  }, [orders]);

  const summaryOf = (userId) => {
    const list = ordersByUser[userId] || [];

    return {
      list,
      count: list.length,
      // Chỉ đơn đã giao mới tính là tiền thu được, khớp cách tính ở trang Thống kê
      spent: list
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    };
  };

  // API trả về toàn bộ danh sách, không nhận tham số lọc -> lọc tại đây
  const filtered = users.filter((u) => {
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
      title: "Khách hàng",
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
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (p) => p || "—",
    },
    {
      title: "Số đơn",
      key: "orderCount",
      width: 100,
      align: "center",
      render: (_, record) => summaryOf(record._id).count,
      sorter: (a, b) => summaryOf(a._id).count - summaryOf(b._id).count,
    },
    {
      title: "Đã chi",
      key: "spent",
      width: 150,
      render: (_, record) => formatCurrency(summaryOf(record._id).spent),
      sorter: (a, b) => summaryOf(a._id).spent - summaryOf(b._id).spent,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
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
    {
      title: "",
      key: "action",
      width: 60,
      // Bấm vào đâu trên dòng cũng mở được, nút này chỉ để nhìn thấy là bấm được
      render: () => <Button type="primary" ghost icon={<EyeOutlined />} />,
    },
  ];

  const detail = selected ? summaryOf(selected._id) : null;

  const orderColumns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      width: 110,
      render: (id) => <code>{id.slice(-8).toUpperCase()}</code>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      width: 150,
      render: (d) => formatDate(d),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      width: 130,
      render: (v) => <strong>{formatCurrency(v)}</strong>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      render: (s) => (
        <Tag color={ORDER_STATUS_COLORS[s]}>{ORDER_STATUS_LABELS[s] || s}</Tag>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <TeamOutlined style={{ marginRight: 8 }} />
        Quản lý khách hàng
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Đang hiện"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Đã ẩn"
              value={stats.locked}
              valueStyle={{ color: stats.locked > 0 ? "#f5222d" : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Input
        placeholder="Tìm theo tên, email hoặc số điện thoại..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "Chưa có khách hàng nào" }}
        onRow={(record) => ({
          onClick: () => setSelected(record),
          style: { cursor: "pointer" },
        })}
      />

      <Modal
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={null}
        width={760}
        title="Chi tiết khách hàng"
        destroyOnClose
      >
        {selected && (
          <>
            <Space align="start" size={16} style={{ marginBottom: 20 }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={selected.avatar || undefined}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selected.fullName}
                </Title>
                <div style={{ color: "#666", marginTop: 4 }}>
                  <MailOutlined style={{ marginRight: 6 }} />
                  {selected.email}
                </div>
                <div style={{ color: "#666", marginTop: 2 }}>
                  <PhoneOutlined style={{ marginRight: 6 }} />
                  {selected.phone || "Chưa có số điện thoại"}
                </div>
                <div style={{ marginTop: 8 }}>
                  {selected.isActive === false ? (
                    <Tag color="red">Đã khóa</Tag>
                  ) : (
                    <Tag color="green">Hoạt động</Tag>
                  )}
                </div>
              </div>
            </Space>

            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Tổng số đơn" value={detail.count} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Đơn đã giao"
                    value={
                      detail.list.filter((o) => o.status === "delivered").length
                    }
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Đã chi tiêu"
                    value={detail.spent}
                    formatter={(v) => formatCurrency(v)}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions
              bordered
              size="small"
              column={2}
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Mã khách hàng" span={2}>
                <code>{selected._id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký">
                {formatDate(selected.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(selected.updatedAt)}
              </Descriptions.Item>
            </Descriptions>

            <Text strong>Lịch sử đơn hàng</Text>
            <Table
              style={{ marginTop: 8 }}
              columns={orderColumns}
              dataSource={detail.list}
              rowKey="_id"
              size="small"
              pagination={detail.list.length > 5 ? { pageSize: 5 } : false}
              locale={{
                emptyText: <Empty description="Khách hàng chưa đặt đơn nào" />,
              }}
              onRow={(order) => ({
                onClick: () => navigate(`/orders/${order._id}`),
                style: { cursor: "pointer" },
              })}
            />
          </>
        )}
      </Modal>
    </Card>
  );
};

export default Users;
