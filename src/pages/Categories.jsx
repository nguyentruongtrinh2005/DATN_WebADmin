import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Card,
  Typography,
  Space,
  Alert,
  message,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  getCategories,
  createCategory,
  updateCategory,
  setCategoryStatus,
} from "../services/category-service";
import StatusSwitch from "../components/StatusSwitch";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";

const { Title } = Typography;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
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
    form.setFieldsValue(record || { name: "" });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await updateCategory(editing._id, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(values);
        message.success("Thêm danh mục thành công");
      }
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleToggleStatus = async (id, nextStatus) => {
    try {
      await setCategoryStatus(id, nextStatus);
      message.success(
        nextStatus === "active" ? "Đã hiện lại danh mục" : "Đã ẩn danh mục"
      );
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 190,
      align: "center",
      render: (_, record) => (
        <StatusSwitch
          status={record.status}
          confirmOff="Mọi sản phẩm thuộc danh mục này cũng sẽ bị ẩn theo."
          onChange={(next) => handleToggleStatus(record._id, next)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý danh mục
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm danh mục
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Danh mục không xoá hẳn được — sản phẩm cũ vẫn tham chiếu tới nó."
      />

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        loading={loading}
        rowClassName={(record) =>
          record.status === "inactive" ? "row-inactive" : ""
        }
      />

      <Modal
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
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
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Ví dụ: Giày Sneaker" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Categories;
