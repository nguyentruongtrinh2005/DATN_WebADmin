import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Card,
  Typography,
  Tag,
  Image,
  Drawer,
  Descriptions,
  Spin,
  Empty,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getVariantsByProduct,
} from "../../services/product-service";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import { formatCurrency } from "../../lib/common";

const { Title } = Typography;

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // Xem chi tiết sản phẩm (drawer bên phải)
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailVariants, setDetailVariants] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success("Xóa sản phẩm thành công");
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // Mở drawer chi tiết: dùng luôn record trong danh sách (đã có brand/category),
  // chỉ cần gọi thêm API lấy biến thể của sản phẩm.
  const openDetail = async (record) => {
    setDetailProduct(record);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailVariants([]);
    try {
      setDetailVariants(await getVariantsByProduct(record._id));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 90,
      align: "center",
      render: (img) =>
        img ? (
          <Image src={toImageUrl(img)} width={56} height={56} style={{ objectFit: "cover", borderRadius: 6 }} />
        ) : (
          "—"
        ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <a onClick={() => openDetail(record)}>
            <strong>{text}</strong>
          </a>
          {record.isFeatured && (
            <Tag color="gold" style={{ marginLeft: 8 }}>
              Nổi bật
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
      key: "brand",
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "Giá",
      key: "price",
      render: (_, record) => (
        <div>
          {record.discountPrice > 0 ? (
            <>
              <div style={{ color: "#f5222d", fontWeight: 600 }}>
                {formatCurrency(record.discountPrice)}
              </div>
              <div style={{ textDecoration: "line-through", color: "#999", fontSize: 12 }}>
                {formatCurrency(record.price)}
              </div>
            </>
          ) : (
            <strong>{formatCurrency(record.price)}</strong>
          )}
        </div>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
      align: "center",
      sorter: (a, b) => a.sold - b.sold,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 170,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDetail(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${record._id}`)}
          />
          <Popconfirm
            title="Xóa sản phẩm này?"
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
          Quản lý sản phẩm
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/products/create")}
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm theo tên sản phẩm..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />

      <Table columns={columns} dataSource={filtered} rowKey="_id" loading={loading} />

      <Drawer
        title="Chi tiết sản phẩm"
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        extra={
          detailProduct && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/products/edit/${detailProduct._id}`)}
            >
              Sửa
            </Button>
          )
        }
      >
        {detailProduct && (
          <>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {detailProduct.image ? (
                <Image
                  src={toImageUrl(detailProduct.image)}
                  width={180}
                  height={180}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 180,
                    height: 180,
                    margin: "0 auto",
                    borderRadius: 8,
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  Chưa có ảnh
                </div>
              )}
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Tên">
                {detailProduct.name}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {detailProduct.brand?.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {detailProduct.category?.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá gốc">
                {formatCurrency(detailProduct.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Giá giảm">
                {detailProduct.discountPrice > 0
                  ? formatCurrency(detailProduct.discountPrice)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Đã bán">
                {detailProduct.sold || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                {detailProduct.rating ?? "—"} ★
              </Descriptions.Item>
              <Descriptions.Item label="Nổi bật">
                {detailProduct.isFeatured ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {detailProduct.status === "active" ? (
                  <Tag color="green">Đang bán</Tag>
                ) : (
                  <Tag color="red">Đã ẩn</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {detailProduct.description || "—"}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 20 }}>
              Biến thể ({detailVariants.length})
            </Title>

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <Spin />
              </div>
            ) : detailVariants.length === 0 ? (
              <Empty description="Chưa có biến thể" />
            ) : (
              <Table
                size="small"
                pagination={false}
                rowKey="_id"
                dataSource={detailVariants}
                columns={[
                  {
                    title: "Màu",
                    key: "color",
                    render: (_, v) => (
                      <Space>
                        <span
                          style={{
                            display: "inline-block",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: v.colorCode,
                            border: "1px solid #ddd",
                          }}
                        />
                        {v.colorName}
                      </Space>
                    ),
                  },
                  { title: "Size", dataIndex: "size", key: "size", align: "center" },
                  {
                    title: "Tồn kho",
                    dataIndex: "stock",
                    key: "stock",
                    align: "center",
                    render: (s) =>
                      s > 0 ? s : <Tag color="red">Hết</Tag>,
                  },
                ]}
              />
            )}
          </>
        )}
      </Drawer>
    </Card>
  );
};

export default Products;
