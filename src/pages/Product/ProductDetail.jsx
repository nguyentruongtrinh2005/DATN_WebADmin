import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Tag,
  Typography,
  Space,
  Table,
  Descriptions,
  Image,
  Statistic,
  Spin,
  Empty,
  Result,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  getProductDetail,
  getVariantsByProduct,
  setProductStatus,
} from "../../services/product-service";
import StatusSwitch from "../../components/StatusSwitch";
import { ColorDot } from "../../components/ColorPalette";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import { formatCurrency, formatDate } from "../../lib/common";

const { Title, Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Hai lời gọi độc lập nhau, chạy song song cho nhanh
      const [detail, variantList] = await Promise.all([
        getProductDetail(id),
        getVariantsByProduct(id),
      ]);

      setProduct(detail);
      setVariants(variantList);
      setNotFound(false);
    } catch (error) {
      setNotFound(true);
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleToggleStatus = async (nextStatus) => {
    try {
      await setProductStatus(id, nextStatus);
      message.success(
        nextStatus === "active" ? "Đã hiện lại sản phẩm" : "Đã ẩn sản phẩm"
      );
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <Result
        status="404"
        title="Không tìm thấy sản phẩm"
        subTitle="Sản phẩm này có thể đã bị xoá khỏi hệ thống."
        extra={
          <Button type="primary" onClick={() => navigate("/products")}>
            Về danh sách sản phẩm
          </Button>
        }
      />
    );
  }

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  // Số màu khác nhau, để biết sản phẩm có bao nhiêu lựa chọn màu
  const colorCount = new Set(variants.map((v) => v.colorName)).size;

  const outOfStock = variants.filter((v) => (Number(v.stock) || 0) === 0).length;

  const variantColumns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 70,
      align: "center",
      render: (img) =>
        img ? (
          <Image
            src={toImageUrl(img)}
            width={40}
            height={40}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          "—"
        ),
    },
    {
      title: "Màu",
      key: "color",
      render: (_, v) => (
        <Space>
          <ColorDot size={14} code={v.colorCode} />
          {v.colorName}
        </Space>
      ),
      sorter: (a, b) => a.colorName.localeCompare(b.colorName),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      align: "center",
      width: 90,
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      width: 110,
      render: (s) => (s > 0 ? s : <Tag color="red">Hết</Tag>),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => <code>{sku || "—"}</code>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      align: "center",
      render: (s) =>
        s === "inactive" ? <Tag>Đã ẩn</Tag> : <Tag color="green">Đang bán</Tag>,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/products")}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Chi tiết sản phẩm
        </Title>
        {product.status === "active" ? (
          <Tag color="green" style={{ fontSize: 14 }}>
            Đang bán
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: 14 }}>
            Đã ẩn
          </Tag>
        )}
      </Space>

      {/* Thanh hành động */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size={24}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${product._id}`)}
          >
            Sửa sản phẩm
          </Button>

          <StatusSwitch
            status={product.status}
            confirmOff="Sản phẩm sẽ không còn hiện trong app khách hàng."
            onChange={handleToggleStatus}
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={9}>
          <Card>
            {product.image ? (
              <Image
                src={toImageUrl(product.image)}
                width="100%"
                style={{
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
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

            <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
              {product.name}
            </Title>

            <Space wrap style={{ marginBottom: 12 }}>
              {product.isFeatured && <Tag color="gold">Nổi bật</Tag>}
              <Tag>{product.brand?.name || "Chưa có thương hiệu"}</Tag>
              <Tag>{product.category?.name || "Chưa có danh mục"}</Tag>
            </Space>

            {product.discountPrice > 0 ? (
              <>
                <div
                  style={{ color: "#f5222d", fontWeight: 700, fontSize: 26 }}
                >
                  {formatCurrency(product.discountPrice)}
                </div>
                <div style={{ textDecoration: "line-through", color: "#999" }}>
                  {formatCurrency(product.price)}
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 26 }}>
                {formatCurrency(product.price)}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Đã bán" value={product.sold || 0} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tồn kho"
                  value={totalStock}
                  valueStyle={{ color: totalStock > 0 ? "#52c41a" : "#f5222d" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic title="Số màu" value={colorCount} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title="Đánh giá"
                  value={product.rating ?? 0}
                  precision={1}
                  prefix={<StarFilled style={{ color: "#fadb14" }} />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Thông tin sản phẩm" size="small">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Thương hiệu">
                {product.brand?.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {product.category?.name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá gốc">
                {formatCurrency(product.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Giá giảm">
                {product.discountPrice > 0
                  ? formatCurrency(product.discountPrice)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Nổi bật">
                {product.isFeatured ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Biến thể hết hàng">
                {outOfStock > 0 ? (
                  <Text type="danger">{outOfStock}</Text>
                ) : (
                  0
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDate(product.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDate(product.updatedAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Mã sản phẩm" span={2}>
                <code>{product._id}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {product.description || "—"}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card
        title={`Biến thể (${variants.length})`}
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Tag color="blue">Tổng tồn kho: {totalStock}</Tag>
            {outOfStock > 0 && <Tag color="red">{outOfStock} hết hàng</Tag>}
          </Space>
        }
      >
        {variants.length === 0 ? (
          <Empty description="Chưa có biến thể — bấm Sửa sản phẩm để thêm màu và size" />
        ) : (
          <Table
            size="small"
            rowKey="_id"
            columns={variantColumns}
            dataSource={variants}
            pagination={variants.length > 10 ? { pageSize: 10 } : false}
            rowClassName={(v) =>
              v.status === "inactive" ? "row-inactive" : ""
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;
