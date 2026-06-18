import express from "express";
import db from "../models/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const brands = await db.Brand.findAll({
      attributes: ["id", "name", "slug", "logo_url", "description"],
      order: [["name", "ASC"]],
    });
    return res.status(200).json({ message: "Success", data: brands });
  } catch (error) {
    console.error("Lỗi lấy danh sách thương hiệu:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
