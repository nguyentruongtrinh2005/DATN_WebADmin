import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Popconfirm,
  Card,
  Typography,
  Space,
  Upload,
  Image,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../services/brand-service";
import { uploadImage } from "../services/product-service";
import { getErrorMessage, toImageUrl } from "../lib/axios";

const { Title } = Typography;

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

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
    setLogo(record?.logo || "");
    form.setFieldsValue(record || { name: "" });
    setModalOpen(true);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setLogo(url);
      message.success("Upload logo thành công");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
    return false; // chặn antd tự upload
  };

  const handleSubmit = async (values) => {
    try {
      const data = { ...values, logo };

      if (editing) {
        await updateBrand(editing._id, data);
        message.success("Cập nhật thương hiệu thành công");
      } else {
        await createBrand(data);
        message.success("Thêm thương hiệu thành công");
      }
      setModalOpen(false);
      form.resetFields();
      setLogo("");
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBrand(id);
      message.success("Xóa thương hiệu thành công");
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
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Xóa thương hiệu này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record._id)}
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
          Quản lý thương hiệu
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Thêm thương hiệu
        </Button>
      </div>

      <Table columns={columns} dataSource={brands} rowKey="_id" loading={loading} />

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

          <Form.Item label="Logo">
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                Chọn ảnh logo
              </Button>
            </Upload>
            {logo && (
              <div style={{ marginTop: 8 }}>
                <Image src={toImageUrl(logo)} width={80} />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Brands;
