import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import viVN from "antd/locale/vi_VN";
import App from "./App.jsx";
import { useThemeStore } from "./store/useThemeStore";
import "antd/dist/reset.css";
import "./index.css";

// Màu lấy từ logo RYDE trong thư mục logo/:
//   #2ECC71 xanh thương hiệu, #1E8449 xanh đậm, #14181A mực, #6E7A7C xám
//
// Hai chế độ dùng hai sắc xanh khác nhau, vì cùng một màu không thể đọc tốt
// trên cả nền trắng lẫn nền đen:
//   Sáng — #1E8449, chữ trắng trên nền này đạt 4.7:1, qua chuẩn WCAG AA.
//          Dùng #2ECC71 thì chỉ 2.1:1, nút bấm mờ tịt.
//   Tối  — #2ECC71, xanh đậm trên nền đen sẽ chìm; xanh sáng đạt khoảng 8:1.

const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#1E8449",
    colorLink: "#1E8449",
    colorSuccess: "#2ECC71",
    colorTextBase: "#14181A",
    colorBgLayout: "#EEF1F0",
    borderRadius: 6,
  },
  components: {
    Layout: {
      siderBg: "#FFFFFF",
      triggerBg: "#FFFFFF",
      triggerColor: "#14181A",
      headerBg: "#FFFFFF",
    },
    Menu: {
      itemBg: "#FFFFFF",
      // Mục đang chọn: nền xanh nhạt, chữ xanh đậm. Không tô nguyên khối
      // #1E8449 vì trên nền trắng một mảng đậm như thế rất nặng mắt.
      itemSelectedBg: "#DCEFE4",
      itemSelectedColor: "#166437",
      itemHoverBg: "#E4EBE7",
      itemHoverColor: "#166437",
      itemColor: "#3C4A44",
    },
  },
};

const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#2ECC71",
    colorLink: "#2ECC71",
    colorSuccess: "#2ECC71",
    colorBgLayout: "#0E1113",
    borderRadius: 6,
  },
  components: {
    Layout: {
      // Menu và header nhạt hơn nền trang một bậc, để ba lớp còn tách nhau
      // ra chứ không dính thành một mảng đen.
      siderBg: "#191E20",
      triggerBg: "#191E20",
      triggerColor: "#E6EBE8",
      headerBg: "#191E20",
    },
    Menu: {
      itemBg: "#191E20",
      itemSelectedBg: "#1E3A2B",
      itemSelectedColor: "#4FE08D",
      itemHoverBg: "#232A2C",
      itemHoverColor: "#4FE08D",
      itemColor: "#B4BEB9",
    },
  },
};

const Root = () => {
  const mode = useThemeStore((state) => state.mode);

  const isDark = mode === "dark";

  // Nền của thẻ body nằm ngoài tầm với của ConfigProvider, phải tự đổi.
  // Thiếu bước này thì lúc chuyển sang tối sẽ lòi ra viền trắng quanh trang.
  useEffect(() => {
    document.body.style.background = isDark ? "#0E1113" : "#EEF1F0";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  return (
    <ConfigProvider locale={viVN} theme={isDark ? darkTheme : lightTheme}>
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
