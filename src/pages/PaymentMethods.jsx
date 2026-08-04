import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Alert,
  Progress,
  Space,
  message,
} from "antd";
import { DollarOutlined, CreditCardOutlined } from "@ant-design/icons";
import { getOrders } from "../services/order-service";
import { getErrorMessage } from "../lib/axios";
import {
  formatCurrency,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "../lib/common";

const { Title, Text } = Typography;

// API định nghĩa phương thức thanh toán bằng enum cứng trong models/Order.js
// (paymentMethod: ["cod", "vnpay"]), không có collection riêng.
// Nên trang này chỉ liệt kê và thống kê, không thêm/sửa/xoá được.
const METHODS = [
  {
    key: "cod",
    name: "COD — Thanh toán khi nhận hàng",
    description:
      "Khách trả tiền mặt cho shipper. Hệ thống tự đánh dấu đã thanh toán khi đơn chuyển sang Đã giao.",
    color: "green",
  },
  {
    key: "vnpay",
    name: "VNPAY — Cổng thanh toán trực tuyến",
    description:
      "Khách thanh toán qua VNPAY. Đơn được đánh dấu đã thanh toán khi VNPAY báo kết quả thành công về API.",
    color: "blue",
  },
];

const PaymentMethods = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setOrders(await getOrders());
      } catch (error) {
        message.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rows = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");

    return METHODS.map((method) => {
      const ofMethod = valid.filter((o) => o.paymentMethod === method.key);

      const paid = ofMethod.filter((o) => o.paymentStatus === "paid");

      return {
        ...method,
        orderCount: ofMethod.length,
        paidCount: paid.length,
        revenue: paid.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingRevenue: ofMethod
          .filter((o) => o.paymentStatus !== "paid")
          .reduce((sum, o) => sum + (o.total || 0), 0),
      };
    });
  }, [orders]);

  const totalOrders = rows.reduce((sum, r) => sum + r.orderCount, 0);
  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);

  const columns = [
    {
      title: "Phương thức",
      key: "name",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <Tag color={record.color}>{record.key.toUpperCase()}</Tag>
            <Text strong>{record.name}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: "Số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      width: 100,
      align: "center",
    },
    {
      title: "Tỉ lệ sử dụng",
      key: "share",
      width: 170,
      render: (_, record) => (
        <Progress
          percent={
            totalOrders === 0
              ? 0
              : Math.round((record.orderCount / totalOrders) * 100)
          }
          size="small"
        />
      ),
    },
    {
      title: "Đã thanh toán",
      key: "paid",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Tag color={PAYMENT_STATUS_COLORS.paid}>
          {record.paidCount} / {record.orderCount}
        </Tag>
      ),
    },
    {
      title: "Doanh thu đã thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 170,
      render: (v) => <strong>{formatCurrency(v)}</strong>,
    },
    {
      title: "Chưa thu",
      dataIndex: "pendingRevenue",
      key: "pendingRevenue",
      width: 150,
      render: (v) => (
        <Text type={v > 0 ? "warning" : "secondary"}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 110,
      align: "center",
      render: () => <Tag color="green">Đang bật</Tag>,
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Phương thức thanh toán
      </Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Hai phương thức này được khai báo cứng trong API (enum của Order). Muốn thêm hoặc tắt phương thức phải sửa backend, không bật/tắt từ đây được."
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Tổng đơn (không tính đơn hủy)"
              value={totalOrders}
              prefix={<CreditCardOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Doanh thu đã thu được"
              value={totalRevenue}
              formatter={(v) => formatCurrency(v)}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Số phương thức đang bật"
              value={METHODS.length}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={rows}
        rowKey="key"
        loading={loading}
        pagination={false}
      />

      <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 12 }}>
        Ghi chú: "Chưa thu" là tiền của các đơn đã đặt nhưng {PAYMENT_STATUS_LABELS.pending.toLowerCase()} — với COD là đơn chưa giao xong, với VNPAY là đơn khách bỏ dở giữa chừng.
      </Text>
    </Card>
  );
};

export default PaymentMethods;
