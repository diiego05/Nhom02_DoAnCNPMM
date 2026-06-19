import { RouteObject } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthGuard from "@/hocs/AuthGuard";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Profile from "@/pages/user/Profile";

import HomePage from "@/pages/shop/HomePage";
import ProductListPage from "@/pages/shop/ProductListPage";
import ProductDetailPage from "@/pages/shop/ProductDetailPage";
import CartPage from "@/pages/shop/CartPage";
import CheckoutPage from "@/pages/shop/CheckoutPage";
import VendorShopPage from "@/pages/shop/VendorShopPage";
import OrderHistoryPage from "@/pages/user/OrderHistoryPage";
import OrderDetailPage from "@/pages/user/OrderDetailPage";
import ReviewPage from "@/pages/user/ReviewPage";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export const getRoutes = (): RouteObject[] => {
  const role = "ADMIN";

  const publicRoutes: RouteObject[] = [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "products",
          element: <ProductListPage />,
        },
        {
          path: "products/:id",
          element: <ProductDetailPage />,
        },
        {
          path: "shop/:id",
          element: <VendorShopPage />,
        },
        {
          path: "profile",
          element: (
            <AuthGuard>
              <Profile />
            </AuthGuard>
          ),
        },
        {
          path: "cart",
          element: <CartPage />,
        },
        {
          path: "checkout",
          element: (
            <AuthGuard>
              <CheckoutPage />
            </AuthGuard>
          ),
        },
        {
          path: "orders",
          element: (
            <AuthGuard>
              <OrderHistoryPage />
            </AuthGuard>
          ),
        },
        {
          path: "orders/:id",
          element: (
            <AuthGuard>
              <OrderDetailPage />
            </AuthGuard>
          ),
        },
        {
          path: "reviews",
          element: (
            <AuthGuard>
              <ReviewPage />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: "auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "verify-otp",
          element: <VerifyOTP />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "logout",
        },
      ],
    },
    {
      path: "vendor",
      element: (
        <AuthGuard>
          <VendorDashboard />
        </AuthGuard>
      ),
    },
    {
      path: "manager",
      element: (
        <AuthGuard>
          <ManagerDashboard />
        </AuthGuard>
      ),
    },
    {
      path: "admin",
      element: (
        <AuthGuard>
          <AdminDashboard />
        </AuthGuard>
      ),
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];

  const adminRoutes: RouteObject[] = [];

  switch (role) {
    case "ADMIN":
      return [...publicRoutes, ...adminRoutes];
    default:
      return publicRoutes;
  }
};
