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
  Switch,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CreditCardOutlined } from "@ant-design/icons";
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../services/system-service";
import { getErrorMessage } from "../lib/axios";

const { Title } = Typography;

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setMethods(await getPaymentMethods());
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
    form.setFieldsValue(record || { name: "", code: "", description: "", isActive: true });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updatePaymentMethod(editing._id, values);
        message.success("Cập nhật thành công");
      } else {
        await createPaymentMethod(values);
        message.success("Thêm thành công");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    { title: "Tên phương thức", dataIndex: "name", key: "name" },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 110,
      render: (c) => <code>{c}</code>,
    },
    { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
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
              await updatePaymentMethod(record._id, { isActive: checked });
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
            title="Xóa phương thức này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await deletePaymentMethod(record._id);
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
          <CreditCardOutlined style={{ marginRight: 8 }} />
          Phương thức thanh toán
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm phương thức
        </Button>
      </div>

      <Table columns={columns} dataSource={methods} rowKey="_id" loading={loading} />

      <Modal
        title={editing ? "Sửa phương thức thanh toán" : "Thêm phương thức thanh toán"}
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
            label="Tên phương thức"
            rules={[{ required: true, message: "Nhập tên!" }]}
          >
            <Input placeholder="Ví dụ: Thanh toán khi nhận hàng" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã (viết thường, không dấu)"
            rules={[{ required: true, message: "Nhập mã!" }]}
          >
            <Input placeholder="cod, bank, momo..." disabled={Boolean(editing)} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PaymentMethods;
