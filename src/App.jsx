import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Product/Products.jsx";
import ProductForm from "./pages/Product/ProductForm.jsx";
import Brands from "./pages/Brands.jsx";
import Categories from "./pages/Categories.jsx";
import Orders from "./pages/Order/Orders.jsx";
import OrderDetail from "./pages/Order/OrderDetail.jsx";
import Vouchers from "./pages/Vouchers.jsx";
import Reviews from "./pages/Reviews.jsx";
import Chat from "./pages/Chat.jsx";
import Users from "./pages/Users.jsx";
import Banners from "./pages/Banners.jsx";
import Notifications from "./pages/Notifications.jsx";
import PaymentMethods from "./pages/PaymentMethods.jsx";
import ShippingProviders from "./pages/ShippingProviders.jsx";
import Complaints from "./pages/Complaints.jsx";
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Staff + Admin */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/chat" element={<Chat />} />

          {/* Chỉ Admin */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/banners"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Banners />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-methods"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PaymentMethods />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipping-providers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ShippingProviders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Complaints />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
