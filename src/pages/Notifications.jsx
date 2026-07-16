import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from "../services/content-service";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";

const { Title } = Typography;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setNotifications(await getNotifications());
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
    form.setFieldsValue(record || { title: "", content: "", type: "system", isActive: true });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateNotification(editing._id, values);
        message.success("Cập nhật thông báo thành công");
      } else {
        await createNotification(values);
        message.success("Thêm thông báo thành công");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title", width: 220 },
    { title: "Nội dung", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (t) =>
        t === "system" ? <Tag color="blue">Hệ thống</Tag> : <Tag color="gold">Khuyến mãi</Tag>,
    },
    {
      title: "Hiển thị",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={async (checked) => {
            try {
              await updateNotification(record._id, { isActive: checked });
              fetchData();
            } catch (error) {
              message.error(getErrorMessage(error));
            }
          }}
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (d) => formatDate(d),
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
            title="Xóa thông báo này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await deleteNotification(record._id);
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
          Thông báo hệ thống
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm thông báo
        </Button>
      </div>

      <Table columns={columns} dataSource={notifications} rowKey="_id" loading={loading} />

      <Modal
        title={editing ? "Sửa thông báo" : "Thêm thông báo"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Nhập nội dung!" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="type" label="Loại">
            <Select
              options={[
                { value: "system", label: "Hệ thống" },
                { value: "promo", label: "Khuyến mãi" },
              ]}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Notifications;
