import { useState } from "react";
import { Switch, Popconfirm, Space, Tag } from "antd";

/**
 * Công tắc bật/tắt trạng thái, dùng chung cho danh mục / thương hiệu / sản phẩm.
 *
 * API không cho xoá hẳn (sản phẩm và đơn hàng cũ còn tham chiếu tới _id),
 * chỉ đổi status active <-> inactive. Nên giao diện dùng công tắc chứ không
 * dùng nút thùng rác — tránh hiểu nhầm là dữ liệu đã mất.
 *
 * Props:
 *  - status: "active" | "inactive"
 *  - onChange: (nextStatus) => Promise  — trang cha gọi API hide/active
 *  - confirmOff: nội dung cảnh báo khi tắt (bỏ trống thì tắt luôn không hỏi)
 */
const StatusSwitch = ({ status, onChange, confirmOff }) => {
  const [loading, setLoading] = useState(false);

  const isActive = status === "active";

  const apply = async () => {
    setLoading(true);
    try {
      await onChange(isActive ? "inactive" : "active");
    } finally {
      setLoading(false);
    }
  };

  const control = (
    <Switch
      size="small"
      loading={loading}
      checked={isActive}
      // Khi có confirmOff, Popconfirm lo phần xác nhận -> không tự đổi ở đây
      onChange={confirmOff && isActive ? undefined : apply}
    />
  );

  return (
    <Space>
      {confirmOff && isActive ? (
        <Popconfirm
          title="Ẩn mục này?"
          description={confirmOff}
          okText="Ẩn"
          cancelText="Không"
          onConfirm={apply}
        >
          {control}
        </Popconfirm>
      ) : (
        control
      )}

      <Tag color={isActive ? "green" : "default"} style={{ margin: 0 }}>
        {isActive ? "Đang hiện" : "Đã ẩn"}
      </Tag>
    </Space>
  );
};

export default StatusSwitch;
