import MainLayout from "@/components/layout/MainLayout";
import NotFound from "@/pages/NotFound";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import Profile from "@/pages/Profile";

export const getRoutes = () => {
  const role = "ADMIN";

  const publicRoutes = [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <div>Home</div>,
        },
        {
          path: "profile",
          element: <Profile />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "register",
      element: <Register />,
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
  ];

  const adminRoutes = [];

  switch (role) {
    case "ADMIN":
      return [...publicRoutes, ...adminRoutes];
    default:
      return publicRoutes;
  }
};
