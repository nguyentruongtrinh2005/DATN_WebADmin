import { useEffect, useState, useRef } from "react";
import {
  Card,
  Row,
  Col,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  Badge,
  Empty,
  message,
} from "antd";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../services/chat-service";
import { getErrorMessage } from "../lib/axios";
import { formatDate } from "../lib/common";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text } = Typography;

const POLL_INTERVAL = 5000;

const Chat = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setConversations(await getConversations());
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessages(await getMessages(conversationId));
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  // Polling: hội thoại + tin nhắn của hội thoại đang mở
  useEffect(() => {
    fetchConversations();

    const timer = setInterval(() => {
      fetchConversations();
      if (selected) fetchMessages(selected._id);
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [selected]);

  useEffect(() => {
    if (selected) fetchMessages(selected._id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!content.trim() || !selected) return;

    setSending(true);
    try {
      await sendMessage(selected._id, content);
      setContent("");
      fetchMessages(selected._id);
      fetchConversations();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        Chat với khách hàng
      </Title>

      <Row gutter={16} style={{ height: "calc(100vh - 240px)", minHeight: 400 }}>
        {/* Danh sách hội thoại */}
        <Col xs={24} md={8} style={{ height: "100%", overflow: "auto", borderRight: "1px solid #f0f0f0" }}>
          <List
            dataSource={conversations}
            locale={{ emptyText: "Chưa có hội thoại nào" }}
            renderItem={(conv) => (
              <List.Item
                onClick={() => setSelected(conv)}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  background: selected?._id === conv._id ? "#e6f4ff" : "transparent",
                  borderRadius: 8,
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={conv.unreadByAdmin} size="small">
                      <Avatar icon={<UserOutlined />} src={conv.user?.avatar || undefined} />
                    </Badge>
                  }
                  title={conv.user?.fullName || "Khách hàng"}
                  description={
                    <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 180 }}>
                      {conv.lastMessage || "..."}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Col>

        {/* Khung tin nhắn */}
        <Col xs={24} md={16} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {selected ? (
            <>
              <div style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                <Text strong>{selected.user?.fullName}</Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {selected.user?.email}
                </Text>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "12px 4px" }}>
                {messages.map((msg) => {
                  const isShop = msg.senderRole !== "user";
                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: "flex",
                        justifyContent: isShop ? "flex-end" : "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "70%",
                          padding: "8px 12px",
                          borderRadius: 12,
                          background: isShop ? "#1677ff" : "#f0f0f0",
                          color: isShop ? "#fff" : "#000",
                        }}
                      >
                        <div>{msg.content}</div>
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.7,
                            marginTop: 2,
                            textAlign: "right",
                          }}
                        >
                          {formatDate(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPressEnter={handleSend}
                  placeholder="Nhập tin nhắn trả lời..."
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={sending}
                  onClick={handleSend}
                >
                  Gửi
                </Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Empty description="Chọn một hội thoại để trả lời" />
            </div>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default Chat;
