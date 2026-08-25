import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Image,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getProducts, setProductStatus } from "../../services/product-service";
import StatusSwitch from "../../components/StatusSwitch";
import { getErrorMessage, toImageUrl } from "../../lib/axios";
import { formatCurrency } from "../../lib/common";

const { Title } = Typography;

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

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

  const handleToggleStatus = async (id, nextStatus) => {
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

  // Chi tiết sản phẩm là một trang riêng, giống chi tiết đơn hàng
  const openDetail = (record) => navigate(`/products/${record._id}`);

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
      title: "Trạng thái",
      key: "status",
      width: 190,
      align: "center",
      render: (_, record) => (
        <StatusSwitch
          status={record.status}
          confirmOff="Sản phẩm sẽ không còn hiện trong app khách hàng."
          onChange={(next) => handleToggleStatus(record._id, next)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => openDetail(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/edit/${record._id}`)}
          />
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

      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Ẩn sản phẩm khỏi app khách hàng, dữ liệu và đơn hàng cũ vẫn giữ nguyên."
      /> */}

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        rowClassName={(record) =>
          record.status === "inactive" ? "row-inactive" : ""
        }
      />
    </Card>
  );
};

export default Products;
