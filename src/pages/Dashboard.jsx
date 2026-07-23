import { useState, useEffect } from "react";
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
  getDashboardStats,
  getRevenue,
  getTopProducts,
  getRecentOrders,
} from "../services/stats-service";
import { getErrorMessage } from "../lib/axios";
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
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [groupBy, setGroupBy] = useState("month");
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, "month"), dayjs()]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsData, top, recent] = await Promise.all([
          getDashboardStats(),
          getTopProducts(5),
          getRecentOrders(5),
        ]);
        setStats(statsData);
        setTopProducts(top);
        setRecentOrders(recent);
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await getRevenue({
          groupBy,
          from: dateRange[0].format("YYYY-MM-DD"),
          to: dateRange[1].format("YYYY-MM-DD"),
        });
        setRevenueData(data);
      } catch (error) {
        message.error(getErrorMessage(error));
      }
    };

    fetchRevenue();
  }, [groupBy, dateRange]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const orderColumns = [
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => formatCurrency(v),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={ORDER_STATUS_COLORS[s]}>{ORDER_STATUS_LABELS[s]}</Tag>,
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
              title="Tổng doanh thu"
              value={stats?.revenue?.total || 0}
              formatter={(v) => formatCurrency(v)}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats?.orders?.total || 0}
              prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chờ xử lý: {stats?.orders?.pending || 0} · Hoàn tất:{" "}
              {stats?.orders?.completed || 0} · Đã hủy: {stats?.orders?.cancelled || 0}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={stats?.users?.total || 0}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={stats?.products?.total || 0}
              prefix={<DropboxOutlined style={{ color: "#fa8c16" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tồn kho: {stats?.products?.totalStock || 0} đôi
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
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
            <Tooltip
              formatter={(value, name) =>
                name === "revenue" ? [formatCurrency(value), "Doanh thu"] : [value, "Số đơn"]
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
              locale={{ emptyText: "Chưa có dữ liệu" }}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: index === 0 ? "#faad14" : "#d9d9d9" }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.productName}
                    description={`Đã bán: ${item.totalSold} · Doanh thu: ${formatCurrency(item.totalRevenue)}`}
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
