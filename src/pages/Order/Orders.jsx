import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  DatePicker,
  Card,
  Typography,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/order-service";
import { getErrorMessage } from "../../lib/axios";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "../../lib/common";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchText) params.search = searchText;
      if (statusFilter) params.status = statusFilter;
      if (dateRange) {
        params.from = dateRange[0].format("YYYY-MM-DD");
        params.to = dateRange[1].format("YYYY-MM-DD");
      }
      setOrders(await getOrders(params));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, dateRange]);

  const countByStatus = (status) => orders.filter((o) => o.status === status).length;

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      width: 110,
      render: (id) => <code>{id.slice(-8).toUpperCase()}</code>,
    },
    { title: "Khách hàng", dataIndex: "customerName", key: "customerName" },
    { title: "SĐT", dataIndex: "phone", key: "phone", width: 120 },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => <strong>{formatCurrency(v)}</strong>,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record._id}`)}
        />
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Quản lý đơn hàng
      </Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Statistic title="Chờ xử lý" value={countByStatus("pending")} />
        </Col>
        <Col span={4}>
          <Statistic title="Đã xác nhận" value={countByStatus("confirmed")} />
        </Col>
        <Col span={4}>
          <Statistic title="Đang giao" value={countByStatus("shipping")} />
        </Col>
        <Col span={4}>
          <Statistic title="Hoàn tất" value={countByStatus("completed")} />
        </Col>
        <Col span={4}>
          <Statistic title="Đã hủy" value={countByStatus("cancelled")} />
        </Col>
        <Col span={4}>
          <Statistic title="Đã hoàn tiền" value={countByStatus("refunded")} />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={10}>
          <Input
            placeholder="Tìm theo tên, SĐT, email khách hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchData}
            allowClear
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: "100%" }}
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Col>
        <Col xs={24} md={8}>
          <RangePicker
            style={{ width: "100%" }}
            value={dateRange}
            onChange={setDateRange}
          />
        </Col>
      </Row>

      <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} />
    </Card>
  );
};

export default Orders;
