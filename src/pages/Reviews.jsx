import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Select,
  Rate,
  Input,
  Image,
  Avatar,
  Row,
  Col,
  Statistic,
  Alert,
  message,
} from "antd";
import { SearchOutlined, UserOutlined, StarOutlined } from "@ant-design/icons";
import { getReviews } from "../services/review-service";
import { getErrorMessage, toImageUrl } from "../lib/axios";
import { formatDate } from "../lib/common";

const { Title, Text, Paragraph } = Typography;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [ratingFilter, setRatingFilter] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      setReviews(await getReviews());
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return { total: 0, average: 0, lowRating: 0 };
    }

    const sum = reviews.reduce((total, r) => total + (r.rating || 0), 0);

    return {
      total: reviews.length,
      average: Number((sum / reviews.length).toFixed(1)),
      lowRating: reviews.filter((r) => r.rating <= 2).length,
    };
  }, [reviews]);

  const filtered = reviews.filter((review) => {
    if (ratingFilter && review.rating !== ratingFilter) return false;

    if (searchText) {
      const keyword = searchText.toLowerCase();
      const haystack = [
        review.comment,
        review.user?.fullName,
        review.product?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(keyword)) return false;
    }

    return true;
  });

  const columns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 260,
      render: (_, record) => (
        <Space>
          {record.product?.image && (
            <Image
              src={toImageUrl(record.product.image)}
              width={44}
              height={44}
              style={{ objectFit: "cover", borderRadius: 4 }}
            />
          )}
          <Text>{record.product?.name || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Khách hàng",
      key: "user",
      width: 190,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            src={record.user?.avatar || undefined}
          />
          <Text>{record.user?.fullName || "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating) => (
        <Space direction="vertical" size={0}>
          <Rate disabled value={rating} style={{ fontSize: 14 }} />
          {rating <= 2 && <Tag color="red">Cần chú ý</Tag>}
        </Space>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      render: (comment, record) => (
        <div>
          <Paragraph
            style={{ marginBottom: record.images?.length ? 8 : 0 }}
            ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
          >
            {comment || <Text type="secondary">(không có nội dung)</Text>}
          </Paragraph>

          {record.images?.length > 0 && (
            <Space>
              {record.images.map((img, i) => (
                <Image
                  key={i}
                  src={toImageUrl(img)}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              ))}
            </Space>
          )}
        </div>
      ),
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (d) => formatDate(d),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Đánh giá & Bình luận
      </Title>

      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Trang này chỉ xem. Trả lời, duyệt và xoá đánh giá cần bổ sung API (model Review hiện chưa có trường trạng thái và phản hồi)."
      /> */}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="Tổng đánh giá" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Điểm trung bình"
              value={stats.average}
              suffix="/ 5"
              prefix={<StarOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Đánh giá thấp (≤ 2★)"
              value={stats.lowRating}
              valueStyle={{ color: stats.lowRating > 0 ? "#f5222d" : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={14}>
          <Input
            placeholder="Tìm theo nội dung, tên khách, tên sản phẩm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            placeholder="Lọc theo số sao"
            style={{ width: "100%" }}
            allowClear
            value={ratingFilter}
            onChange={(v) => setRatingFilter(v ?? null)}
            options={[5, 4, 3, 2, 1].map((star) => ({
              value: star,
              label: `${star} sao`,
            }))}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: "Chưa có đánh giá nào" }}
      />
    </Card>
  );
};

export default Reviews;
