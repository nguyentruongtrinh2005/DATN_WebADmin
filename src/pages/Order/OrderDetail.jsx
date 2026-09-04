import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Typography,
  Space,
  Steps,
  Table,
  Descriptions,
  Modal,
  Spin,
  Alert,
  Image,
  Tooltip,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getOrderById, updateOrderStatus } from "../../services/order-service";
import { ColorDot } from "../../components/ColorPalette";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_FLOW,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "../../lib/common";

const { Title, Text } = Typography;

// Bước tiếp theo cho từng trạng thái.
// Trạng thái cuối là "delivered" theo enum của API (không phải "completed").
const NEXT_STATUS = {
  pending: {
    status: "confirmed",
    label: "Xác nhận đơn",
    icon: <CheckCircleOutlined />,
  },
  confirmed: {
    status: "shipping",
    label: "Giao hàng",
    icon: <CarOutlined />,
  },
  shipping: {
    status: "delivered",
    label: "Đã giao xong",
    icon: <CheckCircleOutlined />,
  },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      setOrder(await getOrderById(id));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const changeStatus = async (status) => {
    setActionLoading(true);
    try {
      await updateOrderStatus(id, status);
      message.success(`Đã chuyển sang "${ORDER_STATUS_LABELS[status]}"`);
      fetchOrder();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: "Hủy đơn hàng",
      content: "Bạn có chắc muốn hủy đơn hàng này?",
      okText: "Hủy đơn",
      okButtonProps: { danger: true },
      cancelText: "Không",
      onOk: () => changeStatus("cancelled"),
    });
  };

  if (loading || !order) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const stepIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextAction = NEXT_STATUS[order.status];
  const canCancel = ["pending", "confirmed"].includes(order.status);

  // Đơn VNPAY phải thanh toán xong mới được xác nhận, tránh giao hàng cho
  // đơn khách bỏ dở giữa chừng ở cổng thanh toán.
  // Đơn COD thì không chặn: tiền chỉ thu được lúc giao, chặn ở đây là kẹt đơn.
  const waitingPayment =
    order.paymentMethod === "vnpay" && order.paymentStatus !== "paid";

  const blockConfirm =
    waitingPayment && nextAction?.status === "confirmed";

  // Thông tin giao hàng nằm trong order.shippingAddress
  const ship = order.shippingAddress || {};

  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "name",
      render: (_, item) => {
        // Khách chọn màu nào thì hiện ảnh của màu đó.
        // Biến thể không có ảnh riêng mới lùi về ảnh sản phẩm chính.
        const image = item.variant?.image || item.product?.image;

        return (
          <Space>
            {image && (
              <Image
                alt="Ảnh sản phẩm trong đơn hàng"
                src={toImageUrl(image)}
                width={48}
                height={48}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            )}
            <div>
              <div>{item.product?.name || "Sản phẩm đã bị xoá"}</div>
              {item.variant ? (
                <Space size={6} style={{ fontSize: 12 }}>
                  <ColorDot size={12} code={item.variant.colorCode} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.variant.colorName} / Size {item.variant.size}
                  </Text>
                </Space>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  —
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    { title: "Đơn giá", dataIndex: "price", render: (v) => formatCurrency(v) },
    { title: "SL", dataIndex: "quantity", align: "center" },
    {
      title: "Thành tiền",
      key: "subtotal",
      render: (_, item) => (
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
      ),
    },
  ];

  const summaryRow = (label, value, strong = false) => (
    <Table.Summary.Row>
      <Table.Summary.Cell colSpan={3} align="right">
        {strong ? <strong>{label}</strong> : label}
      </Table.Summary.Cell>
      <Table.Summary.Cell>
        {strong ? (
          <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
            {formatCurrency(value)}
          </Text>
        ) : (
          formatCurrency(value)
        )}
      </Table.Summary.Cell>
    </Table.Summary.Row>
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/orders")}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Đơn hàng #{order._id.slice(-8).toUpperCase()}
        </Title>
        <Tag color={ORDER_STATUS_COLORS[order.status]} style={{ fontSize: 14 }}>
          {ORDER_STATUS_LABELS[order.status]}
        </Tag>
      </Space>

      {/* Thanh hành động */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          {nextAction && (
            <Tooltip
              title={
                blockConfirm
                  ? "Đơn VNPAY chưa thanh toán — không xác nhận được"
                  : ""
              }
            >
              <Button
                type="primary"
                icon={nextAction.icon}
                loading={actionLoading}
                disabled={blockConfirm}
                onClick={() => changeStatus(nextAction.status)}
              >
                {nextAction.label}
              </Button>
            </Tooltip>
          )}
          {canCancel && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              loading={actionLoading}
              onClick={handleCancel}
            >
              Hủy đơn
            </Button>
          )}
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In hóa đơn
          </Button>
        </Space>

        {blockConfirm && (
          <Alert
            style={{ marginTop: 16 }}
            type="warning"
            showIcon
            message="Đơn VNPAY chưa thanh toán"
            description="Khách chọn thanh toán qua VNPAY nhưng cổng chưa báo kết quả thành công về hệ thống. Chỉ xác nhận đơn sau khi trạng thái thanh toán chuyển sang Đã thanh toán, hoặc hủy đơn nếu khách không thanh toán."
          />
        )}

        {order.status === "cancelled" ? (
          <Alert
            style={{ marginTop: 16 }}
            type="warning"
            showIcon
            message="Đơn hàng đã bị hủy"
          />
        ) : (
          <Steps
            style={{ marginTop: 24 }}
            current={stepIndex}
            items={ORDER_STATUS_FLOW.map((s) => ({
              title: ORDER_STATUS_LABELS[s],
            }))}
          />
        )}
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Sản phẩm">
            <Table
              scroll={{ x: "max-content" }}
              columns={itemColumns}
              dataSource={order.items}
              rowKey={(r, i) => i}
              pagination={false}
              summary={() => (
                <>
                  {summaryRow("Tiền hàng", order.subtotal)}
                  {summaryRow("Phí vận chuyển", order.shippingFee)}
                  {order.discount > 0 && summaryRow("Giảm giá", -order.discount)}
                  {summaryRow("Tổng cộng", order.total, true)}
                </>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">
                {ship.fullName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {ship.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.user?.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {ship.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {formatDate(order.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Thanh toán">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Phương thức">
                {order.paymentMethod?.toUpperCase() || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={PAYMENT_STATUS_COLORS[order.paymentStatus]}>
                  {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                    order.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã giao dịch">
                {order.transactionId || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Hóa đơn — chỉ hiện khi in (class invoice-print, xem index.css) */}
      <div className="invoice-print" style={{ display: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>RYDE Shoes</h1>
          <p style={{ margin: 4 }}>Hóa đơn bán hàng</p>
          <p style={{ margin: 0, fontSize: 13 }}>
            Mã đơn: #{order._id.slice(-8).toUpperCase()} · Ngày:{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>

        <p>
          <strong>Khách hàng:</strong> {ship.fullName} — {ship.phone}
          <br />
          <strong>Địa chỉ:</strong> {ship.address}
        </p>

        <table
          style={{ width: "100%", borderCollapse: "collapse" }}
          border="1"
          cellPadding="6"
        >
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Màu/Size</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td>{item.product?.name}</td>
                <td>
                  {item.variant
                    ? `${item.variant.colorName} / ${item.variant.size}`
                    : "—"}
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" style={{ textAlign: "right" }}>
                Phí vận chuyển
              </td>
              <td>{formatCurrency(order.shippingFee)}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: "right" }}>
                <strong>Tổng cộng</strong>
              </td>
              <td>
                <strong>{formatCurrency(order.total)}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <p style={{ textAlign: "center", marginTop: 24 }}>Cảm ơn quý khách!</p>
      </div>
    </div>
  );
};

export default OrderDetail;
