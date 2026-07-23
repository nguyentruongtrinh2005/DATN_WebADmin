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
  Timeline,
  Descriptions,
  Modal,
  Input,
  InputNumber,
  Spin,
  Alert,
  Image,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  getOrderById,
  updateOrderStatus,
  refundOrder,
} from "../../services/order-service";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "../../lib/common";
import { useAuthStore } from "../../store/useAuthStore";

const { Title, Text } = Typography;

// Bước tiếp theo cho từng trạng thái
const NEXT_STATUS = {
  pending: { status: "confirmed", label: "Xác nhận đơn", icon: <CheckCircleOutlined /> },
  confirmed: { status: "shipping", label: "Giao hàng", icon: <CarOutlined /> },
  shipping: { status: "completed", label: "Hoàn tất", icon: <CheckCircleOutlined /> },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setRefundAmount(data.totalPrice);
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const changeStatus = async (status, note = "") => {
    setActionLoading(true);
    try {
      await updateOrderStatus(id, status, note);
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
      content: "Bạn có chắc muốn hủy đơn hàng này? Tồn kho sẽ được hoàn lại.",
      okText: "Hủy đơn",
      okButtonProps: { danger: true },
      cancelText: "Không",
      onOk: () => changeStatus("cancelled", "Hủy bởi quản trị viên"),
    });
  };

  const handleRefund = async () => {
    setActionLoading(true);
    try {
      await refundOrder(id, { amount: refundAmount, reason: refundReason });
      message.success("Hoàn tiền thành công");
      setRefundModalOpen(false);
      fetchOrder();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const stepIndex = ["pending", "confirmed", "shipping", "completed"].indexOf(order.status);
  const nextAction = NEXT_STATUS[order.status];
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canRefund = order.status === "cancelled" && user?.role === "admin";

  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "name",
      render: (_, item) => (
        <Space>
          {item.image && (
            <Image src={toImageUrl(item.image)} width={48} height={48} style={{ objectFit: "cover", borderRadius: 4 }} />
          )}
          <div>
            <div>{item.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.color} / Size {item.size}
            </Text>
          </div>
        </Space>
      ),
    },
    { title: "Đơn giá", dataIndex: "price", render: (v) => formatCurrency(v) },
    { title: "SL", dataIndex: "quantity", align: "center" },
    {
      title: "Thành tiền",
      key: "subtotal",
      render: (_, item) => <strong>{formatCurrency(item.price * item.quantity)}</strong>,
    },
  ];

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
            <Button
              type="primary"
              icon={nextAction.icon}
              loading={actionLoading}
              onClick={() => changeStatus(nextAction.status)}
            >
              {nextAction.label}
            </Button>
          )}
          {canCancel && (
            <Button danger icon={<CloseCircleOutlined />} onClick={handleCancel}>
              Hủy đơn
            </Button>
          )}
          {canRefund && (
            <Button
              icon={<DollarOutlined />}
              style={{ borderColor: "#722ed1", color: "#722ed1" }}
              onClick={() => setRefundModalOpen(true)}
            >
              Hoàn tiền
            </Button>
          )}
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In hóa đơn
          </Button>
        </Space>

        {["cancelled", "refunded"].includes(order.status) ? (
          <Alert
            style={{ marginTop: 16 }}
            type={order.status === "refunded" ? "info" : "warning"}
            message={
              order.status === "refunded"
                ? `Đã hoàn tiền ${formatCurrency(order.refund?.amount || 0)} — ${order.refund?.reason || ""}`
                : "Đơn hàng đã bị hủy"
            }
          />
        ) : (
          <Steps
            style={{ marginTop: 24 }}
            current={stepIndex}
            items={[
              { title: "Chờ xử lý" },
              { title: "Đã xác nhận" },
              { title: "Đang giao hàng" },
              { title: "Hoàn tất" },
            ]}
          />
        )}
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Sản phẩm" style={{ marginBottom: 16 }}>
            <Table
              columns={itemColumns}
              dataSource={order.items}
              rowKey={(r, i) => i}
              pagination={false}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Phí vận chuyển
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>{formatCurrency(order.shippingFee)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3} align="right">
                      <strong>Tổng cộng</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                        {formatCurrency(order.totalPrice)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />
          </Card>

          <Card title="Lịch sử trạng thái">
            <Timeline
              items={(order.statusHistory || []).map((h) => ({
                color: ORDER_STATUS_COLORS[h.status] === "red" ? "red" : "green",
                children: (
                  <div>
                    <Text strong>{ORDER_STATUS_LABELS[h.status]}</Text>
                    {h.note && <Text type="secondary"> — {h.note}</Text>}
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {formatDate(h.changedAt)}
                      {h.changedBy?.fullName && ` · ${h.changedBy.fullName}`}
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thông tin khách hàng">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">{order.customerName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{order.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{order.address}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{order.note || "—"}</Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {order.paymentMethod?.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Vận chuyển">
                {order.shippingProvider?.toUpperCase() || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{formatDate(order.createdAt)}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Modal hoàn tiền */}
      <Modal
        title="Hoàn tiền đơn hàng"
        open={refundModalOpen}
        onCancel={() => setRefundModalOpen(false)}
        onOk={handleRefund}
        okText="Xác nhận hoàn tiền"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <div style={{ marginBottom: 12 }}>
          <Text>Số tiền hoàn:</Text>
          <InputNumber
            style={{ width: "100%", marginTop: 4 }}
            min={0}
            max={order.totalPrice}
            value={refundAmount}
            onChange={setRefundAmount}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </div>
        <div>
          <Text>Lý do:</Text>
          <Input.TextArea
            rows={3}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Lý do hoàn tiền..."
          />
        </div>
      </Modal>

      {/* Hóa đơn — chỉ hiện khi in (class invoice-print, xem index.css) */}
      <div className="invoice-print" style={{ display: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>StepUp Shoes</h1>
          <p style={{ margin: 4 }}>Hóa đơn bán hàng</p>
          <p style={{ margin: 0, fontSize: 13 }}>
            Mã đơn: #{order._id.slice(-8).toUpperCase()} · Ngày: {formatDate(order.createdAt)}
          </p>
        </div>

        <p>
          <strong>Khách hàng:</strong> {order.customerName} — {order.phone}
          <br />
          <strong>Địa chỉ:</strong> {order.address}
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="6">
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
                <td>{item.name}</td>
                <td>
                  {item.color} / {item.size}
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
                <strong>{formatCurrency(order.totalPrice)}</strong>
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
