import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Select,
  DatePicker,
  Spin,
  Typography,
  List,
  Avatar,
  Alert,
  message,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DropboxOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  getStatsSource,
  buildOverview,
  buildRevenueSeries,
  buildTopProducts,
  buildRecentOrders,
} from "../services/stats-service";
import { getErrorMessage, toImageUrl } from "../lib/axios";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "../lib/common";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Dữ liệu thô lấy một lần, mọi con số bên dưới tính từ đây
  const [source, setSource] = useState(null);

  const [groupBy, setGroupBy] = useState("month");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(6, "month"),
    dayjs(),
  ]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        setSource(await getStatsSource());
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = useMemo(
    () => (source ? buildOverview(source) : null),
    [source]
  );

  const revenueData = useMemo(
    () =>
      source
        ? buildRevenueSeries(
            source.orders,
            groupBy,
            dateRange[0],
            dateRange[1]
          )
        : [],
    [source, groupBy, dateRange]
  );

  const topProducts = useMemo(
    () => (source ? buildTopProducts(source.orders, 5) : []),
    [source]
  );

  const recentOrders = useMemo(
    () => (source ? buildRecentOrders(source.orders, 5) : []),
    [source]
  );

  if (loading || !stats) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const orderColumns = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => record.shippingAddress?.fullName || "—",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (v) => formatCurrency(v),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => (
        <Tag color={ORDER_STATUS_COLORS[s]}>{ORDER_STATUS_LABELS[s]}</Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  return (
    <div>
      <Title level={3}>Thống kê tổng quan</Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Số liệu được tính trực tiếp từ danh sách đơn hàng và sản phẩm. Doanh thu không tính đơn đã hủy."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.revenue}
              formatter={(v) => formatCurrency(v)}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đã thanh toán: {formatCurrency(stats.paidRevenue)}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.orders.total}
              prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chờ xử lý: {stats.orders.pending} · Đã giao:{" "}
              {stats.orders.delivered} · Đã hủy: {stats.orders.cancelled}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách đã mua hàng"
              value={stats.customers}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              API chưa có thống kê người dùng
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={stats.products.total}
              prefix={<DropboxOutlined style={{ color: "#fa8c16" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đang bán: {stats.products.active} · Tồn kho:{" "}
              {stats.products.totalStock} đôi
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ marginTop: 16 }}
        title="Biểu đồ doanh thu"
        extra={
          <span>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 120, marginRight: 8 }}
              options={[
                { value: "day", label: "Theo ngày" },
                { value: "month", label: "Theo tháng" },
                { value: "year", label: "Theo năm" },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(range) => range && setDateRange(range)}
              allowClear={false}
            />
          </span>
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}tr` : v
              }
            />
            <Tooltip
              formatter={(value, name) =>
                name === "revenue"
                  ? [formatCurrency(value), "Doanh thu"]
                  : [value, "Số đơn"]
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2ecc71"
              fill="url(#revColor)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ color: "#faad14", marginRight: 8 }} />
                Sản phẩm bán chạy
              </span>
            }
          >
            <List
              dataSource={topProducts}
              locale={{ emptyText: "Chưa có đơn hàng nào" }}
              renderItem={(item, index) => (
                <List.Item
                  onClick={() => navigate(`/products/edit/${item.productId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <List.Item.Meta
                    avatar={
                      item.image ? (
                        <Avatar src={toImageUrl(item.image)} shape="square" />
                      ) : (
                        <Avatar
                          style={{
                            backgroundColor:
                              index === 0 ? "#faad14" : "#d9d9d9",
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      )
                    }
                    title={item.productName}
                    description={`Đã bán: ${item.totalSold} · Doanh thu: ${formatCurrency(
                      item.totalRevenue
                    )}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="Đơn hàng gần đây">
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              rowKey="_id"
              pagination={false}
              size="small"
              locale={{ emptyText: "Chưa có đơn hàng nào" }}
              onRow={(record) => ({
                onClick: () => navigate(`/orders/${record._id}`),
                style: { cursor: "pointer" },
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
