import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "accessToken jwt expired" });
      }
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

export const isVendor = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.Role, as: "role" }]
    });

    if (!user || user.role?.role_name !== "vendor") {
      return res.status(403).json({ message: "Quyền truy cập bị từ chối. Chỉ dành cho vai trò Vendor." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Lỗi kiểm tra quyền hạn" });
  }
};
