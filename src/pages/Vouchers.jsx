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
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  toggleVoucherStatus,
  deleteVoucher,
} from "../services/voucher-service";
import { getErrorMessage } from "../lib/axios";
import { formatCurrency, formatDate } from "../lib/common";

const { Title } = Typography;

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchText, setSearchText] = useState("");
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
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: 0,
        // API bắt buộc quantity >= 1
        quantity: 100,
      });
    }

    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const { dateRange, ...rest } = values;

      // API bắt buộc có startDate và endDate, không nhận null
      const data = {
        ...rest,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
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
      await toggleVoucherStatus(record._id);
      message.success(
        record.status === "active" ? "Đã ẩn voucher" : "Đã hiển thị voucher"
      );
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVoucher(id);
      message.success("Đã xóa voucher");
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // API trả về toàn bộ danh sách, không nhận tham số lọc -> lọc tại đây
  const filtered = vouchers.filter((v) => {
    if (!searchText.trim()) return true;

    const keyword = searchText.trim().toLowerCase();
    const haystack = [v.code, v.name, v.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      render: (code) => <strong style={{ letterSpacing: 1 }}>{code}</strong>,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name, r) => (
        <div>
          <div>{name}</div>
          {r.description && (
            <span style={{ fontSize: 12, color: "#999" }}>{r.description}</span>
          )}
        </div>
      ),
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
      render: (_, r) => {
        const used = r.usedCount || 0;
        const soldOut = r.quantity > 0 && used >= r.quantity;

        return (
          <span style={{ color: soldOut ? "#f5222d" : undefined }}>
            {used}/{r.quantity}
            {soldOut && " (hết)"}
          </span>
        );
      },
    },
    {
      title: "Hiệu lực",
      key: "period",
      width: 190,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          {formatDate(r.startDate)}
          <br />
          {formatDate(r.endDate)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (s, r) => {
        if (s !== "active") return <Tag color="red">Đã ẩn</Tag>;

        // Còn bật nhưng đã quá hạn -> API vẫn để active, phải tự nhận ra
        if (r.endDate && dayjs(r.endDate).isBefore(dayjs())) {
          return <Tag color="orange">Hết hạn</Tag>;
        }

        if (r.startDate && dayjs(r.startDate).isAfter(dayjs())) {
          return <Tag color="blue">Chưa bắt đầu</Tag>;
        }

        return <Tag color="green">Đang áp dụng</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
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
          <Popconfirm
            title="Xóa hẳn voucher này?"
            description="Không khôi phục được. Muốn tạm ngưng thì dùng nút ẩn."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
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

      <Input
        placeholder="Tìm theo mã, tên hoặc mô tả voucher..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />

      <Table
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        locale={{
          emptyText: searchText
            ? "Không tìm thấy voucher nào"
            : "Chưa có voucher nào",
        }}
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

          <Form.Item
            name="name"
            label="Tên voucher"
            rules={[{ required: true, message: "Vui lòng nhập tên voucher!" }]}
          >
            <Input placeholder="Ví dụ: Giảm 10% tháng 8" />
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
                min={1}
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

          <Form.Item
            name="quantity"
            label="Số lượng voucher phát hành"
            rules={[{ required: true, message: "Nhập số lượng!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian hiệu lực"
            rules={[{ required: true, message: "Chọn thời gian hiệu lực!" }]}
          >
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
