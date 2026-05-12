import { authService, type LoginFormData } from "@/services/authService";
import { userService } from "@/services/userService";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { setToken, setUser } from "@/stores/slices/authSlice";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user; // Convert user to a boolean value

  const handleLogin = async (data: LoginFormData) => {
    try {
      console.log("BASE URL:", import.meta.env.VITE_API_BASE_URL);
      const response = await authService.login(data);

      if (response.data?.data) {
        const { accessToken, user } = response.data.data;
        console.log("user:", user);
        dispatch(setUser(user));
        dispatch(setToken({ accessToken }));
      }
    } catch (error) {}
  };

  const handleLogout = async () => {
    try {
      const response = await authService.logout();

      console.log("Logout response:", response);

      dispatch(setUser(null));
      dispatch(setToken({ accessToken: "" }));
      navigate("/auth/login");
    } catch {
      dispatch(setUser(null));
      dispatch(setToken({ accessToken: "" }));
      navigate("/auth/login");
    }
  };

  const getUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      return response?.data?.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  return {
    isAuthenticated,
    user,
    handleLogin,
    handleLogout,
  };
};
export default useAuth;
