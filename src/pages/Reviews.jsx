import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Select,
  Rate,
  Modal,
  Input,
  Popconfirm,
  Tooltip,
  Badge,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  DeleteOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  getReviews,
  replyReview,
  moderateReview,
  recheckReview,
  deleteReview,
} from "../services/review-service";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text, Paragraph } = Typography;

const STATUS_LABELS = {
  pending: { label: "Chờ duyệt", color: "orange" },
  approved: { label: "Đã duyệt", color: "green" },
  rejected: { label: "Từ chối", color: "red" },
};

const Reviews = () => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [replying, setReplying] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (flaggedOnly) params.flagged = "true";
      setReviews(await getReviews(params));
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, flaggedOnly]);

  const doAction = async (fn, successMsg) => {
    try {
      await fn();
      message.success(successMsg);
      fetchData();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleReply = () =>
    doAction(async () => {
      await replyReview(replying._id, replyContent);
      setReplying(null);
      setReplyContent("");
    }, "Trả lời thành công");

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      key: "product",
      width: 160,
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "fullName"],
      key: "user",
      width: 140,
    },
    {
      title: "Nội dung",
      key: "content",
      render: (_, record) => (
        <div>
          {record.rating && <Rate disabled value={record.rating} style={{ fontSize: 13 }} />}
          <Paragraph style={{ margin: "4px 0" }}>{record.content}</Paragraph>

          {record.aiModeration?.flagged && (
            <Tooltip title={record.aiModeration.reason}>
              <Tag icon={<WarningOutlined />} color="error">
                AI cảnh báo
              </Tag>
            </Tooltip>
          )}

          {record.reply?.content && (
            <div
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: 6,
                padding: "6px 10px",
                marginTop: 4,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Shop trả lời ({record.reply.repliedBy?.fullName}):
              </Text>
              <div>{record.reply.content}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s) => <Tag color={STATUS_LABELS[s]?.color}>{STATUS_LABELS[s]?.label}</Tag>,
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d) => formatDate(d),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space wrap>
          {record.status !== "approved" && (
            <Tooltip title="Duyệt">
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckOutlined />}
                onClick={() =>
                  doAction(() => moderateReview(record._id, "approved"), "Đã duyệt")
                }
              />
            </Tooltip>
          )}
          {record.status !== "rejected" && (
            <Tooltip title="Từ chối">
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() =>
                  doAction(() => moderateReview(record._id, "rejected"), "Đã từ chối")
                }
              />
            </Tooltip>
          )}
          <Tooltip title="Trả lời">
            <Button
              size="small"
              icon={<MessageOutlined />}
              onClick={() => {
                setReplying(record);
                setReplyContent(record.reply?.content || "");
              }}
            />
          </Tooltip>
          <Tooltip title="Kiểm tra lại bằng AI">
            <Button
              size="small"
              icon={<RobotOutlined />}
              onClick={() =>
                doAction(() => recheckReview(record._id), "Đã kiểm tra lại bằng AI")
              }
            />
          </Tooltip>
          {user?.role === "admin" && (
            <Popconfirm
              title="Xóa đánh giá này?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => doAction(() => deleteReview(record._id), "Đã xóa")}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const flaggedCount = reviews.filter((r) => r.aiModeration?.flagged).length;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            Đánh giá & Bình luận
          </Title>
          {flaggedCount > 0 && (
            <Badge count={`${flaggedCount} AI cảnh báo`} style={{ backgroundColor: "#ff4d4f" }} />
          )}
        </Space>
        <Space>
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: 140 }}
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            options={Object.entries(STATUS_LABELS).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
          <Button
            type={flaggedOnly ? "primary" : "default"}
            danger={flaggedOnly}
            icon={<WarningOutlined />}
            onClick={() => setFlaggedOnly(!flaggedOnly)}
          >
            Chỉ AI cảnh báo
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={reviews} rowKey="_id" loading={loading} />

      <Modal
        title="Trả lời đánh giá"
        open={Boolean(replying)}
        onCancel={() => setReplying(null)}
        onOk={handleReply}
        okText="Gửi trả lời"
        cancelText="Hủy"
      >
        {replying && (
          <div
            style={{
              background: "#fafafa",
              padding: 10,
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <Text type="secondary">
              {replying.user?.fullName}: {replying.content}
            </Text>
          </div>
        )}
        <Input.TextArea
          rows={4}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Nội dung trả lời khách hàng..."
        />
      </Modal>
    </Card>
  );
};

export default Reviews;
