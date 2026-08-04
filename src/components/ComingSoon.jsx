import { Card, Result, Typography, Tag, Space, Alert } from "antd";
import { ToolOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

/**
 * Khung "Đang phát triển" cho các trang mà API chưa có endpoint.
 *
 * Code gốc của từng trang vẫn giữ nguyên bên dưới câu lệnh return này —
 * khi backend làm xong, chỉ cần xoá đoạn early-return ở đầu component là
 * trang chạy lại như cũ, không phải viết lại từ đầu.
 *
 * Props:
 *  - title: tên chức năng
 *  - reason: vì sao chưa làm được
 *  - todo: mảng các việc cần làm để bật lại
 */
const ComingSoon = ({ title, reason, todo = [] }) => (
  <Card>
    <Result
      icon={<ToolOutlined style={{ color: "#faad14" }} />}
      title={
        <Space>
          {title}
          <Tag color="orange">Đang phát triển</Tag>
        </Space>
      }
      subTitle={reason}
    />

    {todo.length > 0 && (
      <Alert
        type="info"
        showIcon
        style={{ maxWidth: 640, margin: "0 auto" }}
        message="Cần bổ sung để bật chức năng này"
        description={
          <Paragraph style={{ marginBottom: 0 }}>
            <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
              {todo.map((item, i) => (
                <li key={i}>
                  <Text>{item}</Text>
                </li>
              ))}
            </ul>
          </Paragraph>
        }
      />
    )}
  </Card>
);

export default ComingSoon;
