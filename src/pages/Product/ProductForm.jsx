import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Card,
  Row,
  Col,
  Table,
  Switch,
  Typography,
  Space,
  Popconfirm,
  Image,
  Alert,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductDetail,
  createProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  getVariantsByProduct,
} from "../../services/product-service";
import { getBrands } from "../../services/brand-service";
import { getCategories } from "../../services/category-service";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import { COLOR_OPTIONS, SIZE_OPTIONS, getColorCode } from "../../lib/common";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  // Xem trước ảnh theo link đang gõ
  const imageUrl = Form.useWatch("image", form);

  // Biến thể: dòng có _id là đã lưu trên server, dòng có tempId là mới thêm
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  // Khối "thêm nhanh": chọn 1 màu + nhiều size cùng lúc
  const [quickColor, setQuickColor] = useState(COLOR_OPTIONS[0].name);
  const [quickSizes, setQuickSizes] = useState([]);
  const [quickStock, setQuickStock] = useState(10);

  useEffect(() => {
    const init = async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          getBrands(),
          getCategories(),
        ]);
        setBrands(brandList);
        setCategories(categoryList);

        if (isEdit) {
          // API admin trả thẳng object sản phẩm trong data, không bọc { product }
          const product = await getProductDetail(id);

          form.setFieldsValue({
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: product.discountPrice,
            image: product.image || "",
            brand: product.brand?._id || product.brand,
            category: product.category?._id || product.category,
            isFeatured: product.isFeatured,
          });

          setVariants(await getVariantsByProduct(id));
        }
      } catch (error) {
        message.error(getErrorMessage(error));
      }
    };

    init();
  }, [id]);

  const rowKeyOf = (v) => v._id || v.tempId;

  const addQuickVariants = () => {
    if (quickSizes.length === 0) {
      message.warning("Chọn ít nhất một size");
      return;
    }

    const existed = new Set(variants.map((v) => `${v.colorName}-${v.size}`));

    const added = quickSizes
      .filter((size) => !existed.has(`${quickColor}-${size}`))
      .map((size, i) => ({
        tempId: `${Date.now()}-${i}`,
        colorName: quickColor,
        colorCode: getColorCode(quickColor),
        size,
        stock: quickStock ?? 0,
        image: "",
      }));

    if (added.length === 0) {
      message.warning("Các size đã chọn đều đã có với màu này");
      return;
    }

    setVariants([...variants, ...added]);
    setQuickSizes([]);

    const skipped = quickSizes.length - added.length;
    message.success(
      `Đã thêm ${added.length} biến thể` +
        (skipped > 0 ? ` (bỏ qua ${skipped} size đã có)` : "")
    );
  };

  const updateVariantRow = (key, field, value) => {
    setVariants(
      variants.map((v) => {
        if (rowKeyOf(v) !== key) return v;

        // Đổi tên màu thì mã màu phải đổi theo, API bắt buộc khớp cặp này
        if (field === "colorName") {
          return { ...v, colorName: value, colorCode: getColorCode(value) };
        }

        return { ...v, [field]: value };
      })
    );
  };

  const removeVariantRow = (record) => {
    if (record._id) {
      setDeletedVariantIds([...deletedVariantIds, record._id]);
    }
    setVariants(variants.filter((v) => rowKeyOf(v) !== rowKeyOf(record)));
  };

  const handleSubmit = async (values) => {
    // Không cho 2 biến thể trùng màu + size (API cũng chặn, chặn sớm cho gọn)
    const keys = variants.map((v) => `${v.colorName}-${v.size}`);
    if (new Set(keys).size !== keys.length) {
      message.error("Có biến thể trùng màu và size!");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...values,
        image: (values.image || "").trim(),
        discountPrice: values.discountPrice || 0,
      };

      let productId = id;

      if (isEdit) {
        await updateProduct(id, data);
      } else {
        const created = await createProduct(data);
        productId = created._id;
      }

      // Đồng bộ biến thể
      for (const variantId of deletedVariantIds) {
        await deleteVariant(variantId);
      }

      for (const variant of variants) {
        const body = {
          product: productId,
          colorName: variant.colorName,
          colorCode: variant.colorCode || getColorCode(variant.colorName),
          size: Number(variant.size),
          stock: Number(variant.stock) || 0,
          image: variant.image || "",
        };

        if (variant._id) {
          await updateVariant(variant._id, body);
        } else {
          await createVariant(body);
        }
      }

      message.success(
        isEdit ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công"
      );
      navigate("/products");
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const variantColumns = [
    {
      title: "Màu sắc",
      dataIndex: "colorName",
      render: (colorName, record) => (
        <Space>
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: record.colorCode || getColorCode(colorName),
              border: "1px solid #ddd",
            }}
          />
          <Select
            value={colorName}
            style={{ width: 140 }}
            options={COLOR_OPTIONS.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
            onChange={(v) => updateVariantRow(rowKeyOf(record), "colorName", v)}
          />
        </Space>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      width: 110,
      render: (size, record) => (
        <Select
          value={size}
          style={{ width: 90 }}
          options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
          onChange={(v) => updateVariantRow(rowKeyOf(record), "size", v)}
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      width: 120,
      render: (stock, record) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(v) => updateVariantRow(rowKeyOf(record), "stock", v || 0)}
        />
      ),
    },
    {
      title: "Ảnh theo màu (link)",
      dataIndex: "image",
      render: (img, record) => (
        <Space>
          {img && (
            <Image
              src={toImageUrl(img)}
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: 4 }}
            />
          )}
          <Input
            value={img}
            placeholder="https://... (không bắt buộc)"
            style={{ width: 260 }}
            onChange={(e) =>
              updateVariantRow(rowKeyOf(record), "image", e.target.value)
            }
          />
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title="Bỏ biến thể này?"
          okText="Bỏ"
          cancelText="Hủy"
          onConfirm={() => removeVariantRow(record)}
        >
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </Title>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
            >
              <Input placeholder="Ví dụ: Nike Air Force 1" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label="Thương hiệu"
                  rules={[{ required: true, message: "Chọn thương hiệu!" }]}
                >
                  <Select
                    placeholder="Chọn thương hiệu"
                    options={brands.map((b) => ({
                      value: b._id,
                      label:
                        b.status === "inactive" ? `${b.name} (đã ẩn)` : b.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: "Chọn danh mục!" }]}
                >
                  <Select
                    placeholder="Chọn danh mục"
                    options={categories.map((c) => ({
                      value: c._id,
                      label:
                        c.status === "inactive" ? `${c.name} (đã ẩn)` : c.name,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Giá gốc (VNĐ)"
                  rules={[{ required: true, message: "Nhập giá!" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="discountPrice"
                  label="Giá giảm (VNĐ, để trống nếu không giảm)"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} placeholder="Mô tả sản phẩm..." />
            </Form.Item>

            <Form.Item
              name="isFeatured"
              label="Sản phẩm nổi bật"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} lg={10}>
            <Form.Item
              name="image"
              label="Ảnh sản phẩm (dán link)"
              extra="Bấm chuột phải vào ảnh trên mạng > Sao chép địa chỉ hình ảnh, rồi dán vào đây."
              rules={[{ type: "url", message: "Link ảnh không hợp lệ!" }]}
            >
              <Input prefix={<LinkOutlined />} placeholder="https://..." allowClear />
            </Form.Item>

            {imageUrl && (
              <Image
                src={toImageUrl(imageUrl)}
                width={200}
                style={{ borderRadius: 8 }}
                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23fafafa'/%3E%3Ctext x='100' y='104' font-size='14' fill='%23999' text-anchor='middle'%3ELink anh loi%3C/text%3E%3C/svg%3E"
              />
            )}
          </Col>
        </Row>

        <Card
          type="inner"
          title="Biến thể (Màu / Size / Tồn kho)"
          style={{ marginBottom: 24 }}
        >
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Chọn một màu rồi tích nhiều size cùng lúc — mỗi size sẽ thành một biến thể riêng."
          />

          <Space wrap align="end" style={{ marginBottom: 16 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Màu
              </Text>
              <br />
              <Select
                value={quickColor}
                style={{ width: 160 }}
                onChange={setQuickColor}
                options={COLOR_OPTIONS.map((c) => ({
                  value: c.name,
                  label: (
                    <Space>
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: c.code,
                          border: "1px solid #ddd",
                        }}
                      />
                      {c.name}
                    </Space>
                  ),
                }))}
              />
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Size (chọn nhiều)
              </Text>
              <br />
              <Select
                mode="multiple"
                allowClear
                value={quickSizes}
                onChange={setQuickSizes}
                style={{ minWidth: 320 }}
                placeholder="Chọn size..."
                options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tồn kho mỗi size
              </Text>
              <br />
              <InputNumber min={0} value={quickStock} onChange={setQuickStock} />
            </div>

            <Space>
              <Button icon={<PlusOutlined />} onClick={addQuickVariants}>
                Thêm biến thể
              </Button>
              <Button
                size="small"
                type="link"
                onClick={() => setQuickSizes(SIZE_OPTIONS)}
              >
                Chọn tất cả size
              </Button>
            </Space>
          </Space>

          <Table
            columns={variantColumns}
            dataSource={variants}
            rowKey={rowKeyOf}
            pagination={false}
            size="small"
            locale={{ emptyText: "Chưa có biến thể — chọn màu và size ở trên" }}
            footer={() => (
              <Space>
                <Tag>{variants.length} biến thể</Tag>
                <Tag color="blue">
                  Tổng tồn kho:{" "}
                  {variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)}
                </Tag>
              </Space>
            )}
          />
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving} size="large">
            {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
          </Button>
          <Button size="large" onClick={() => navigate("/products")}>
            Hủy bỏ
          </Button>
        </Space>
      </Form>
    </Card>
  );
};

export default ProductForm;
