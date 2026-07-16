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
  Upload,
  Image,
  Popconfirm,
  DatePicker,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../services/content-service";
import { uploadImage } from "../services/product-service";
import { getErrorMessage, toImageUrl } from "../lib/axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      setBanners(await getBanners(params));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const openModal = (record = null) => {
    setEditing(record);
    setImage(record?.image || "");
    form.setFieldsValue(
      record
        ? {
            ...record,
            dateRange:
              record.startDate && record.endDate
                ? [dayjs(record.startDate), dayjs(record.endDate)]
                : null,
          }
        : { title: "", type: "banner", position: "home_top", link: "", isActive: true }
    );
    setModalOpen(true);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImage(url);
      message.success("Upload ảnh thành công");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleSubmit = async (values) => {
    if (!image) {
      message.error("Vui lòng upload ảnh!");
      return;
    }

    const { dateRange, ...rest } = values;
    const data = {
      ...rest,
      image,
      startDate: dateRange?.[0]?.toISOString() || null,
      endDate: dateRange?.[1]?.toISOString() || null,
    };

    try {
      if (editing) {
        await updateBanner(editing._id, data);
        message.success("Cập nhật thành công");
      } else {
        await createBanner(data);
        message.success("Thêm thành công");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 130,
      render: (img) => <Image src={toImageUrl(img)} width={110} style={{ borderRadius: 6 }} />,
    },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (t) =>
        t === "banner" ? <Tag color="blue">Banner</Tag> : <Tag color="purple">Quảng cáo</Tag>,
    },
    { title: "Vị trí", dataIndex: "position", key: "position", width: 120 },
    {
      title: "Hiển thị",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={async (checked) => {
            try {
              await updateBanner(record._id, { isActive: checked });
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
            title="Xóa banner này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              try {
                await deleteBanner(record._id);
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
          Banner & Quảng cáo
        </Title>
        <Space>
          <Select
            placeholder="Lọc loại"
            style={{ width: 140 }}
            allowClear
            value={typeFilter || undefined}
            onChange={(v) => setTypeFilter(v || "")}
            options={[
              { value: "banner", label: "Banner" },
              { value: "ad", label: "Quảng cáo" },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={banners} rowKey="_id" loading={loading} />

      <Modal
        title={editing ? "Sửa banner/quảng cáo" : "Thêm banner/quảng cáo"}
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

          <Form.Item name="type" label="Loại">
            <Select
              options={[
                { value: "banner", label: "Banner" },
                { value: "ad", label: "Quảng cáo" },
              ]}
            />
          </Form.Item>

          <Form.Item name="position" label="Vị trí hiển thị">
            <Select
              options={[
                { value: "home_top", label: "Đầu trang chủ" },
                { value: "home_middle", label: "Giữa trang chủ" },
                { value: "sidebar", label: "Thanh bên" },
              ]}
            />
          </Form.Item>

          <Form.Item name="link" label="Đường dẫn khi bấm vào">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="dateRange" label="Thời gian hiển thị (tùy chọn)">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Ảnh" required>
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={uploading}>
                Chọn ảnh
              </Button>
            </Upload>
            {image && (
              <div style={{ marginTop: 8 }}>
                <Image src={toImageUrl(image)} width={200} />
              </div>
            )}
          </Form.Item>

          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Banners;
