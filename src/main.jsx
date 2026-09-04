import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider, theme as antdTheme } from "antd";
import viVN from "antd/locale/vi_VN";
import App from "./App.jsx";
import { useThemeStore } from "./store/useThemeStore";
import "antd/dist/reset.css";
import "./index.css";

// Màu lấy từ bảng màu của ứng dụng di động (ShoeStore/src/constants/colors.js)
// để web quản trị và app cùng một nhận diện:
//   #2563EB xanh dương chính, #F97316 cam phụ, #111827 mực, #6B7280 xám
//
// Hai chế độ dùng hai sắc xanh khác nhau, vì cùng một màu không thể đọc tốt
// trên cả nền trắng lẫn nền đen:
//   Sáng — #2563EB, chữ trắng trên nền này đạt 5.2:1, qua chuẩn WCAG AA.
//   Tối  — #60A5FA, xanh #2563EB trên nền tối chỉ đạt 3.2:1 nên bị chìm;
//          xanh nhạt hơn đạt khoảng 6.5:1.
//
// Màu xanh lá vẫn giữ cho colorSuccess: đó là màu mang nghĩa thành công,
// không phải màu thương hiệu.

const lightTheme = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#2563EB",
    colorLink: "#2563EB",
    colorSuccess: "#16A34A",
    colorTextBase: "#111827",
    colorBgLayout: "#EFF1F5",
    borderRadius: 6,
  },
  components: {
    Layout: {
      siderBg: "#FFFFFF",
      triggerBg: "#FFFFFF",
      triggerColor: "#111827",
      headerBg: "#FFFFFF",
    },
    Menu: {
      itemBg: "#FFFFFF",
      // Mục đang chọn: nền xanh nhạt, chữ xanh đậm. Không tô nguyên khối
      // #2563EB vì trên nền trắng một mảng đậm như thế rất nặng mắt.
      itemSelectedBg: "#DEE8FC",
      itemSelectedColor: "#1D4ED8",
      itemHoverBg: "#E6EAF1",
      itemHoverColor: "#1D4ED8",
      itemColor: "#3F4854",
    },
  },
};

const darkTheme = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: "#60A5FA",
    colorLink: "#60A5FA",
    colorSuccess: "#4ADE80",
    colorBgLayout: "#0D1117",
    borderRadius: 6,
  },
  components: {
    Layout: {
      // Menu và header nhạt hơn nền trang một bậc, để ba lớp còn tách nhau
      // ra chứ không dính thành một mảng đen.
      siderBg: "#171C24",
      triggerBg: "#171C24",
      triggerColor: "#E6EAF0",
      headerBg: "#171C24",
    },
    Menu: {
      itemBg: "#171C24",
      itemSelectedBg: "#1C2E4F",
      itemSelectedColor: "#7CB4FB",
      itemHoverBg: "#212836",
      itemHoverColor: "#7CB4FB",
      itemColor: "#B6BECC",
    },
  },
};

const Root = () => {
  const mode = useThemeStore((state) => state.mode);

  const isDark = mode === "dark";

  // Nền của thẻ body nằm ngoài tầm với của ConfigProvider, phải tự đổi.
  // Thiếu bước này thì lúc chuyển sang tối sẽ lòi ra viền trắng quanh trang.
  useEffect(() => {
    document.body.style.background = isDark ? "#0D1117" : "#EFF1F5";
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
