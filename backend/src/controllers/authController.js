import authService from "../services/authService.js";

//REGISTER
const register = async (req, res) => {
  try {
    const { email, phone, password, role_id } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await authService.register({
      email,
      phone,
      password,
      role_id,
    });

    return res.status(response.status).json(response);
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Internal server error: " + error.message,
      stack: error.stack,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email_or_phone, password } = req.body;

    if (!email_or_phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await authService.login({
      email_or_phone,
      password,
    });

    if (response.status === 200 && response.data?.refreshToken) {
      res.cookie("refreshToken", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      delete response.data.refreshToken;
    }

    return res.status(response.status).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// REFRESH TOKEN
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is missing from cookies" });
    }

    const response = await authService.refreshToken(refreshToken);

    if (response.status === 200 && response.data?.refreshToken) {
      res.cookie("refreshToken", response.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      delete response.data.refreshToken;
    }

    return res.status(response.status).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  register,
  login,
  refresh,
  logout,
};
