import { useState } from "react";
import {
  Button,
  ColorPicker,
  Input,
  Popconfirm,
  Popover,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { COLOR_PRESETS, contrastText, normalizeHex } from "../lib/common";

const { Text } = Typography;

const NEW_KEY = "__new__";

// Ô màu tròn dùng chung cho nút chọn và cho ô xem trước
const Dot = ({ code, size = 36, selected }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      background: code,
      border: "1px solid #d9d9d9",
      boxShadow: selected ? "0 0 0 3px #1677ff" : "none",
      transition: "box-shadow .15s",
    }}
  >
    {selected && (
      <CheckOutlined style={{ fontSize: 14, color: contrastText(code) }} />
    )}
  </span>
);

// Bảng nhỏ hiện ra khi bấm vào một màu: chọn mã hex + đặt tên
const ColorEditor = ({
  initial,
  takenNames,
  usedCount,
  onSubmit,
  onDelete,
  onCancel,
}) => {
  const [name, setName] = useState(initial?.name || "");
  const [code, setCode] = useState(initial?.code || "#1677FF");

  const pickPreset = (preset) => {
    setCode(preset.code);
    // Chỉ gợi ý tên khi admin chưa tự gõ, tránh ghi đè cái họ đang nhập
    if (!name.trim()) setName(preset.name);
  };

  const submit = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      message.warning("Nhập tên màu");
      return;
    }

    const hex = normalizeHex(code);

    if (!hex) {
      message.warning("Mã màu không hợp lệ");
      return;
    }

    const duplicated = takenNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicated) {
      message.warning("Tên màu này đã có trong danh sách");
      return;
    }

    onSubmit({ name: trimmed, code: hex });
  };

  return (
    <div style={{ width: 250 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Mã màu
      </Text>
      <div style={{ marginTop: 4, marginBottom: 12 }}>
        <Space>
          <ColorPicker
            value={code}
            disabledAlpha
            onChange={(value) =>
              setCode(typeof value === "string" ? value : value.toHexString())
            }
          />
          <Input
            value={code}
            style={{ width: 130 }}
            onChange={(e) => setCode(e.target.value)}
            onBlur={() => setCode(normalizeHex(code) || code)}
            placeholder="#RRGGBB"
          />
        </Space>
      </div>

      <Text type="secondary" style={{ fontSize: 12 }}>
        Màu gợi ý
      </Text>
      <div style={{ marginTop: 4, marginBottom: 12 }}>
        <Space wrap size={6}>
          {COLOR_PRESETS.map((preset) => (
            <Tooltip key={preset.name} title={preset.name}>
              <span
                onClick={() => pickPreset(preset)}
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: preset.code,
                  border: "1px solid #d9d9d9",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          ))}
        </Space>
      </div>

      <Text type="secondary" style={{ fontSize: 12 }}>
        Tên màu
      </Text>
      <Input
        autoFocus
        value={name}
        style={{ marginTop: 4 }}
        placeholder="Ví dụ: Xanh rêu"
        onChange={(e) => setName(e.target.value)}
        onPressEnter={submit}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {initial ? (
          <Popconfirm
            title="Xoá màu này?"
            description={
              usedCount > 0
                ? `${usedCount} biến thể đang dùng màu này cũng sẽ bị bỏ.`
                : "Màu này chưa có biến thể nào."
            }
            okText="Xoá"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={onDelete}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xoá màu
            </Button>
          </Popconfirm>
        ) : (
          <span />
        )}

        <Space>
          <Button size="small" onClick={onCancel}>
            Hủy
          </Button>
          <Button size="small" type="primary" onClick={submit}>
            Lưu
          </Button>
        </Space>
      </div>
    </div>
  );
};

/**
 * Bảng màu của sản phẩm.
 * Bấm vào một màu để chọn, bấm lại lần nữa vào màu đang chọn để sửa mã/tên.
 *
 * colors    [{ name, code }]  danh sách màu của sản phẩm
 * value     tên màu đang chọn
 * usageOf   (name) => số biến thể đang dùng màu đó
 */
const ColorPalette = ({
  colors,
  value,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  usageOf = () => 0,
}) => {
  const [openKey, setOpenKey] = useState(null);

  const close = () => setOpenKey(null);

  return (
    <Space wrap size={12} align="start">
      {colors.map((color) => {
        const selected = value === color.name;

        return (
          <Popover
            key={color.name}
            trigger="click"
            placement="bottomLeft"
            open={openKey === color.name}
            destroyTooltipOnHide
            title="Sửa màu"
            content={
              <ColorEditor
                initial={color}
                usedCount={usageOf(color.name)}
                takenNames={colors
                  .filter((c) => c.name !== color.name)
                  .map((c) => c.name)}
                onSubmit={(next) => {
                  onEdit(color.name, next);
                  close();
                }}
                onDelete={() => {
                  onDelete(color.name);
                  close();
                }}
                onCancel={close}
              />
            }
            onOpenChange={(next) => {
              if (!next) {
                close();
                return;
              }

              // Bấm lần đầu chỉ chọn màu, bấm lại vào màu đang chọn mới mở sửa
              if (!selected) {
                onSelect(color.name);
                close();
                return;
              }

              setOpenKey(color.name);
            }}
          >
            <div
              style={{
                width: 72,
                textAlign: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <Dot code={color.code} selected={selected} />
              <div
                title={color.name}
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {color.name}
              </div>
            </div>
          </Popover>
        );
      })}

      <Popover
        trigger="click"
        placement="bottomLeft"
        open={openKey === NEW_KEY}
        destroyTooltipOnHide
        title="Thêm màu mới"
        content={
          <ColorEditor
            takenNames={colors.map((c) => c.name)}
            onSubmit={(next) => {
              onAdd(next);
              close();
            }}
            onCancel={close}
          />
        }
        onOpenChange={(next) => setOpenKey(next ? NEW_KEY : null)}
      >
        <div style={{ width: 72, textAlign: "center", cursor: "pointer" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px dashed #bfbfbf",
              color: "#8c8c8c",
            }}
          >
            <PlusOutlined />
          </span>
          <div style={{ fontSize: 12, marginTop: 4, color: "#8c8c8c" }}>
            Thêm màu
          </div>
        </div>
      </Popover>
    </Space>
  );
};

export { Dot as ColorDot };
export default ColorPalette;
