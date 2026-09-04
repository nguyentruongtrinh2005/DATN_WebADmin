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
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
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

// Màu cho biểu đồ trạng thái đơn, khớp với màu thẻ Tag trong bảng
const STATUS_FILL = {
  pending: "#FA8C16",
  confirmed: "#1890FF",
  shipping: "#13C2C2",
  delivered: "#2ECC71",
  cancelled: "#F5222D",
};

const METHOD_LABELS = { cod: "COD", vnpay: "VNPAY" };
const METHOD_FILL = { cod: "#2ECC71", vnpay: "#1890FF" };

// Rút gọn trục tiền: 2.500.000 -> 2.5tr
const formatShort = (v) =>
  v >= 1000000 ? `${(v / 1000000).toFixed(1)}tr` : v >= 1000 ? `${v / 1000}k` : v;

const revenueTooltip = (value, name) =>
  name === "revenue" ? [formatCurrency(value), "Doanh thu"] : [value, "Số đơn"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Dữ liệu thô lấy một lần, mọi con số bên dưới tính từ đây
  const [source, setSource] = useState(null);

  const [groupBy, setGroupBy] = useState("month");
  const [chartType, setChartType] = useState("area");
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

  const statusData = useMemo(
    () =>
      stats
        ? stats.byStatus.map((s) => ({
            ...s,
            label: ORDER_STATUS_LABELS[s.status],
          }))
        : [],
    [stats]
  );

  const methodData = useMemo(
    () =>
      stats
        ? stats.byPaymentMethod
            .filter((m) => m.count > 0)
            .map((m) => ({ ...m, label: METHOD_LABELS[m.method] }))
        : [],
    [stats]
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

    

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu (đơn đã giao)"
              value={stats.revenue}
              formatter={(v) => formatCurrency(v)}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đang xử lý: {formatCurrency(stats.pendingRevenue)} · Trung bình
              mỗi đơn: {formatCurrency(stats.avgOrderValue)}
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
              title="Tổng khách hàng"
              value={stats.customers.total}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đã mua: {stats.customers.bought} · Chưa mua:{" "}
              {stats.customers.notBought}
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
              value={chartType}
              onChange={setChartType}
              style={{ width: 130, marginRight: 8 }}
              options={[
                { value: "area", label: "Biểu đồ miền" },
                { value: "line", label: "Biểu đồ đường" },
                { value: "bar", label: "Biểu đồ cột" },
              ]}
            />
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
          {chartType === "bar" ? (
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatShort} />
              <Tooltip formatter={revenueTooltip} />
              <Bar dataKey="revenue" fill="#2ecc71" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatShort} />
              <Tooltip formatter={revenueTooltip} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2ecc71"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#2ecc71" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatShort} />
              <Tooltip formatter={revenueTooltip} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2ecc71"
                fill="url(#revColor)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Số đơn theo trạng thái">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v) => [v, "Số đơn"]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_FILL[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Phương thức thanh toán">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={methodData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={(e) => `${e.label}: ${e.count}`}
                >
                  {methodData.map((entry) => (
                    <Cell key={entry.method} fill={METHOD_FILL[entry.method]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, "Số đơn"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

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
              scroll={{ x: "max-content" }}
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
