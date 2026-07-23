import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Card,
  Typography,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  hideVoucher,
  activeVoucher,
} from "../services/voucher-service";
import { getErrorMessage } from "../lib/axios";
import { formatCurrency } from "../lib/common";

const { Title } = Typography;

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Theo dõi kiểu giảm để đổi nhãn ô nhập (% hay đ) và ẩn/hiện "giảm tối đa"
  const discountType = Form.useWatch("discountType", form);

  const fetchData = async () => {
    setLoading(true);
    try {
      setVouchers(await getVouchers());
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

    if (record) {
      form.setFieldsValue({
        ...record,
        // API trả ngày dạng chuỗi ISO -> đổi sang dayjs cho DatePicker
        dateRange:
          record.startDate || record.endDate
            ? [
                record.startDate ? dayjs(record.startDate) : null,
                record.endDate ? dayjs(record.endDate) : null,
              ]
            : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        discountType: "percent",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        usageLimit: 0,
      });
    }

    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const { dateRange, ...rest } = values;

      const data = {
        ...rest,
        startDate: dateRange?.[0] ? dateRange[0].toISOString() : null,
        endDate: dateRange?.[1] ? dateRange[1].toISOString() : null,
      };

      if (editing) {
        await updateVoucher(editing._id, data);
        message.success("Cập nhật voucher thành công");
      } else {
        await createVoucher(data);
        message.success("Thêm voucher thành công");
      }

      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const toggleStatus = async (record) => {
    try {
      if (record.status === "active") {
        await hideVoucher(record._id);
        message.success("Đã ẩn voucher");
      } else {
        await activeVoucher(record._id);
        message.success("Đã hiển thị voucher");
      }
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (code) => <strong style={{ letterSpacing: 1 }}>{code}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Giảm",
      key: "discount",
      render: (_, r) =>
        r.discountType === "percent" ? (
          <span>
            {r.discountValue}%
            {r.maxDiscount > 0 && (
              <span style={{ color: "#999" }}>
                {" "}
                (tối đa {formatCurrency(r.maxDiscount)})
              </span>
            )}
          </span>
        ) : (
          formatCurrency(r.discountValue)
        ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      render: (v) => (v > 0 ? formatCurrency(v) : "—"),
    },
    {
      title: "Lượt dùng",
      key: "usage",
      align: "center",
      render: (_, r) =>
        r.usageLimit > 0 ? `${r.usedCount}/${r.usageLimit}` : `${r.usedCount}/∞`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (s) =>
        s === "active" ? (
          <Tag color="green">Đang áp dụng</Tag>
        ) : (
          <Tag color="red">Đã ẩn</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Tooltip title={record.status === "active" ? "Ẩn" : "Hiển thị"}>
            <Button
              icon={
                record.status === "active" ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )
              }
              onClick={() => toggleStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý voucher
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Thêm voucher
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editing ? "Sửa voucher" : "Thêm voucher"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã voucher"
            rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
          >
            <Input
              placeholder="Ví dụ: SALE10"
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input placeholder="Giảm 10% cho đơn từ 1 triệu..." />
          </Form.Item>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item
              name="discountType"
              label="Kiểu giảm"
              style={{ width: 140 }}
            >
              <Select
                options={[
                  { value: "percent", label: "Theo %" },
                  { value: "fixed", label: "Số tiền" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="discountValue"
              label={discountType === "percent" ? "Giá trị (%)" : "Giá trị (đ)"}
              rules={[{ required: true, message: "Nhập giá trị giảm!" }]}
            >
              <InputNumber
                min={0}
                max={discountType === "percent" ? 100 : undefined}
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Space>

          {discountType === "percent" && (
            <Form.Item
              name="maxDiscount"
              label="Giảm tối đa (đ) — 0 là không giới hạn"
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          )}

          <Form.Item name="minOrderValue" label="Đơn tối thiểu (đ)">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>

          <Form.Item name="usageLimit" label="Giới hạn lượt dùng — 0 là không giới hạn">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="dateRange" label="Thời gian hiệu lực (để trống nếu không giới hạn)">
            <DatePicker.RangePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Vouchers;
