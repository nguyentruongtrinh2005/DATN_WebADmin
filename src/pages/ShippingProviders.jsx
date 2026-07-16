import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined } from "@ant-design/icons";
import {
  getShippingProviders,
  createShippingProvider,
  updateShippingProvider,
  deleteShippingProvider,
} from "../services/system-service";
import { getErrorMessage } from "../lib/axios";
import { formatCurrency } from "../lib/common";

const { Title } = Typography;

const ShippingProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setProviders(await getShippingProviders());
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (record = null) => {
    setEditing(record);
    form.setFieldsValue(
      record || { name: "", code: "", fee: 30000, estimatedDays: 3, isActive: true }
    );
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateShippingProvider(editing._id, values);
        message.success("Cập nhật thành công");
      } else {
        await createShippingProvider(values);
        message.success("Thêm thành công");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    { title: "Tên đơn vị", dataIndex: "name", key: "name" },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (c) => <code>{c}</code>,
    },
    {
      title: "Phí giao hàng",
      dataIndex: "fee",
      key: "fee",
      width: 140,
      render: (v) => formatCurrency(v),
    },
    {
      title: "Thời gian giao (ngày)",
      dataIndex: "estimatedDays",
      key: "estimatedDays",
      width: 160,
      align: "center",
    },
    {
      title: "Kích hoạt",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={async (checked) => {
            try {
              await updateShippingProvider(record._id, { isActive: checked });
              fetchData();
            } catch (error) {
              message.error(getErrorMessage(error));
            }
          }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Xóa đơn vị này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await deleteShippingProvider(record._id);
                message.success("Đã xóa");
                fetchData();
              } catch (error) {
                message.error(getErrorMessage(error));
              }
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <CarOutlined style={{ marginRight: 8 }} />
          Đơn vị vận chuyển
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm đơn vị
        </Button>
      </div>

      <Table columns={columns} dataSource={providers} rowKey="_id" loading={loading} />

      <Modal
        title={editing ? "Sửa đơn vị vận chuyển" : "Thêm đơn vị vận chuyển"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên đơn vị"
            rules={[{ required: true, message: "Nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Giao Hàng Nhanh" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã (viết thường, không dấu)"
            rules={[{ required: true, message: "Nhập mã!" }]}
          >
            <Input placeholder="ghn, ghtk..." disabled={Boolean(editing)} />
          </Form.Item>

          <Form.Item
            name="fee"
            label="Phí giao hàng (VNĐ)"
            rules={[{ required: true, message: "Nhập phí!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>

          <Form.Item name="estimatedDays" label="Thời gian giao dự kiến (ngày)">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ShippingProviders;
