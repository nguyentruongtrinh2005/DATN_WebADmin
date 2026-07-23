import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  Card,
  Row,
  Col,
  Table,
  Switch,
  Typography,
  Space,
  Popconfirm,
  Image,
  message,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
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
  uploadImage,
} from "../../services/product-service";
import { getBrands } from "../../services/brand-service";
import { getCategories } from "../../services/category-service";
import { getErrorMessage, toImageUrl } from "../../lib/axios";

const { Title } = Typography;
const { TextArea } = Input;

const COLORS = ["Đen", "Trắng", "Xám", "Đỏ", "Xanh dương", "Xanh lá", "Nâu", "Be"];
const SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Biến thể: dòng có _id là đã lưu trên server, dòng có tempId là mới thêm
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [brandList, categoryList] = await Promise.all([getBrands(), getCategories()]);
        setBrands(brandList);
        setCategories(categoryList);

        if (isEdit) {
          const detail = await getProductDetail(id);
          const { product } = detail;

          form.setFieldsValue({
            name: product.name,
            description: product.description,
            price: product.price,
            discountPrice: product.discountPrice,
            brand: product.brand?._id,
            category: product.category?._id,
            isFeatured: product.isFeatured,
          });
          setImage(product.image || "");

          const variantList = await getVariantsByProduct(id);
          setVariants(variantList);
        }
      } catch (error) {
        message.error(getErrorMessage(error));
      }
    };

    init();
  }, [id]);

  const handleUploadMain = async (file) => {
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

  const addVariantRow = () => {
    setVariants([
      ...variants,
      { tempId: Date.now(), color: "Đen", size: 40, stock: 0, image: "" },
    ]);
  };

  const updateVariantRow = (key, field, value) => {
    setVariants(
      variants.map((v) => ((v._id || v.tempId) === key ? { ...v, [field]: value } : v))
    );
  };

  const removeVariantRow = (record) => {
    if (record._id) {
      setDeletedVariantIds([...deletedVariantIds, record._id]);
    }
    setVariants(variants.filter((v) => (v._id || v.tempId) !== (record._id || record.tempId)));
  };

  const handleVariantImageUpload = async (key, file) => {
    try {
      const { url } = await uploadImage(file);
      updateVariantRow(key, "image", url);
      message.success("Upload ảnh biến thể thành công");
    } catch (error) {
      message.error(getErrorMessage(error));
    }
    return false;
  };

  const handleSubmit = async (values) => {
    if (!image) {
      message.error("Vui lòng upload ảnh sản phẩm!");
      return;
    }

    // Không cho 2 biến thể trùng màu + size
    const keys = variants.map((v) => `${v.color}-${v.size}`);
    if (new Set(keys).size !== keys.length) {
      message.error("Có biến thể trùng màu và size!");
      return;
    }

    setSaving(true);
    try {
      const data = { ...values, image, discountPrice: values.discountPrice || 0 };

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
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          image: variant.image || "",
        };

        if (variant._id) {
          await updateVariant(variant._id, body);
        } else {
          await createVariant(body);
        }
      }

      message.success(isEdit ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công");
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
      dataIndex: "color",
      render: (color, record) => (
        <Select
          value={color}
          style={{ width: 130 }}
          options={COLORS.map((c) => ({ value: c, label: c }))}
          onChange={(v) => updateVariantRow(record._id || record.tempId, "color", v)}
        />
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      render: (size, record) => (
        <Select
          value={size}
          style={{ width: 90 }}
          options={SIZES.map((s) => ({ value: s, label: s }))}
          onChange={(v) => updateVariantRow(record._id || record.tempId, "size", v)}
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      render: (stock, record) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(v) => updateVariantRow(record._id || record.tempId, "stock", v || 0)}
        />
      ),
    },
    {
      title: "Ảnh (theo màu)",
      dataIndex: "image",
      render: (img, record) => (
        <Space>
          {img && <Image src={toImageUrl(img)} width={40} height={40} style={{ objectFit: "cover" }} />}
          <Upload
            beforeUpload={(file) => handleVariantImageUpload(record._id || record.tempId, file)}
            showUploadList={false}
            accept="image/*"
          >
            <Button size="small" icon={<UploadOutlined />} />
          </Upload>
        </Space>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Popconfirm
          title="Xóa biến thể này?"
          okText="Xóa"
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
                    options={brands.map((b) => ({ value: b._id, label: b.name }))}
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
                    options={categories.map((c) => ({ value: c._id, label: c.name }))}
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
                <Form.Item name="discountPrice" label="Giá giảm (VNĐ, để trống nếu không giảm)">
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

            <Form.Item name="isFeatured" label="Sản phẩm nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>

          <Col xs={24} lg={10}>
            <Form.Item label="Ảnh sản phẩm" required>
              <Upload beforeUpload={handleUploadMain} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Chọn ảnh
                </Button>
              </Upload>
              {image && (
                <div style={{ marginTop: 12 }}>
                  <Image src={toImageUrl(image)} width={200} style={{ borderRadius: 8 }} />
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Card
          type="inner"
          title="Biến thể (Size / Màu / Tồn kho)"
          extra={
            <Button icon={<PlusOutlined />} onClick={addVariantRow}>
              Thêm biến thể
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={variantColumns}
            dataSource={variants}
            rowKey={(r) => r._id || r.tempId}
            pagination={false}
            size="small"
            locale={{ emptyText: "Chưa có biến thể — bấm 'Thêm biến thể'" }}
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
