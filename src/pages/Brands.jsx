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
  Image,
  Alert,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";
import {
  getBrands,
  createBrand,
  updateBrand,
  setBrandStatus,
} from "../services/brand-service";
import StatusSwitch from "../components/StatusSwitch";
import { getErrorMessage, toImageUrl } from "../lib/axios";

const { Title } = Typography;

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Xem trước logo theo link đang gõ trong ô "Logo"
  const logoUrl = Form.useWatch("logo", form);

  const fetchData = async () => {
    setLoading(true);
    try {
      setBrands(await getBrands());
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
    form.setFieldsValue(record || { name: "", logo: "" });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        name: values.name,
        logo: (values.logo || "").trim(),
      };

      if (editing) {
        await updateBrand(editing._id, data);
        message.success("Cập nhật thương hiệu thành công");
      } else {
        await createBrand(data);
        message.success("Thêm thương hiệu thành công");
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
      await setBrandStatus(id, nextStatus);
      message.success(
        nextStatus === "active"
          ? "Đã hiện lại thương hiệu"
          : "Đã ẩn thương hiệu"
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
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      width: 100,
      align: "center",
      render: (logo) =>
        logo ? <Image src={toImageUrl(logo)} width={48} height={48} style={{ objectFit: "contain" }} /> : "—",
    },
    { title: "Tên thương hiệu", dataIndex: "name", key: "name" },
    {
      title: "Trạng thái",
      key: "status",
      width: 190,
      align: "center",
      render: (_, record) => (
        <StatusSwitch
          status={record.status}
          confirmOff="Mọi sản phẩm thuộc thương hiệu này cũng sẽ bị ẩn theo."
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
          Quản lý thương hiệu
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm thương hiệu
        </Button>
      </div>


      <Table
        columns={columns}
        dataSource={brands}
        rowKey="_id"
        loading={loading}
        rowClassName={(record) =>
          record.status === "inactive" ? "row-inactive" : ""
        }
      />

      <Modal
        title={editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}
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
            label="Tên thương hiệu"
            rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu!" }]}
          >
            <Input placeholder="Ví dụ: Nike" />
          </Form.Item>

          <Form.Item
            name="logo"
            label="Logo (dán link ảnh)"
            extra="Dán link ảnh trên mạng, ví dụ https://.../nike.png — bấm chuột phải vào ảnh > Sao chép địa chỉ hình ảnh."
            rules={[{ type: "url", message: "Link ảnh không hợp lệ!" }]}
          >
            <Input prefix={<LinkOutlined />} placeholder="https://..." allowClear />
          </Form.Item>

          {logoUrl && (
            <div style={{ marginTop: -8, marginBottom: 8 }}>
              <Image
                src={toImageUrl(logoUrl)}
                width={80}
                height={80}
                style={{ objectFit: "contain", border: "1px solid #f0f0f0", borderRadius: 6 }}
                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23fafafa'/%3E%3Ctext x='40' y='44' font-size='10' fill='%23999' text-anchor='middle'%3ELink lỗi%3C/text%3E%3C/svg%3E"
              />
            </div>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default Brands;
