import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  Input,
  Checkbox,
  Descriptions,
  message,
} from "antd";
import { ExclamationCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getComplaints, updateComplaint } from "../services/system-service";
import { getErrorMessage } from "../lib/axios";
import { formatCurrency, formatDate } from "../lib/common";

const { Title, Text } = Typography;

const STATUS_LABELS = {
  open: { label: "Mới", color: "red" },
  processing: { label: "Đang xử lý", color: "orange" },
  resolved: { label: "Đã giải quyết", color: "green" },
  rejected: { label: "Từ chối", color: "default" },
};

const Complaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("processing");
  const [note, setNote] = useState("");
  const [refunded, setRefunded] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      setComplaints(await getComplaints(params));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const openDetail = (record) => {
    setSelected(record);
    setNewStatus(record.status === "open" ? "processing" : record.status);
    setNote(record.resolution?.note || "");
    setRefunded(record.resolution?.refunded || false);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateComplaint(selected._id, { status: newStatus, note, refunded });
      message.success("Cập nhật khiếu nại thành công");
      setSelected(null);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: ["user", "fullName"],
      key: "user",
      width: 150,
    },
    {
      title: "Đơn hàng",
      key: "order",
      width: 130,
      render: (_, record) =>
        record.order ? (
          <a onClick={() => navigate(`/orders/${record.order._id}`)}>
            #{record.order._id?.slice(-8).toUpperCase()}
          </a>
        ) : (
          "—"
        ),
    },
    { title: "Nội dung", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => <Tag color={STATUS_LABELS[s]?.color}>{STATUS_LABELS[s]?.label}</Tag>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d) => formatDate(d),
    },
    {
      title: "",
      key: "action",
      width: 70,
      render: (_, record) => (
        <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => openDetail(record)} />
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Giải quyết khiếu nại
        </Title>
        <Select
          placeholder="Lọc trạng thái"
          style={{ width: 150 }}
          allowClear
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter(v || "")}
          options={Object.entries(STATUS_LABELS).map(([value, { label }]) => ({ value, label }))}
        />
      </div>

      <Table columns={columns} dataSource={complaints} rowKey="_id" loading={loading} />

      <Modal
        title="Xử lý khiếu nại"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        onOk={handleUpdate}
        okText="Cập nhật"
        cancelText="Đóng"
        confirmLoading={saving}
        width={620}
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Khách hàng">
                {selected.user?.fullName} — {selected.user?.phone || selected.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn hàng">
                #{selected.order?._id?.slice(-8).toUpperCase()} ·{" "}
                {formatCurrency(selected.order?.totalPrice || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung khiếu nại">
                {selected.content}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Trạng thái xử lý:</Text>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                style={{ width: "100%", marginTop: 4 }}
                options={[
                  { value: "processing", label: "Đang xử lý" },
                  { value: "resolved", label: "Đã giải quyết" },
                  { value: "rejected", label: "Từ chối" },
                ]}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <Text strong>Ghi chú xử lý:</Text>
              <Input.TextArea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Kết quả xử lý, phản hồi cho khách..."
              />
            </div>

            {newStatus === "resolved" && (
              <Checkbox checked={refunded} onChange={(e) => setRefunded(e.target.checked)}>
                Hoàn tiền cho khách (đơn sẽ tự chuyển sang "Đã hoàn tiền")
              </Checkbox>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
};

export default Complaints;
