import express from "express";
import rateLimit from "express-rate-limit";
import userController from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const editLimiter = rateLimit({
  windowMs: 1000 * 60 * 15,
  max: 30,
  message: "Too many attempts, please try again later",
});

const editProfileRules = (req, res, next) => {
  const { full_name, id_card } = req.body;

  if (full_name && full_name.length > 200) {
    return res
      .status(400)
      .json({ message: "Full name must not exceed 200 characters" });
  }
  if (id_card && id_card !== "" && !/^\d{9,12}$/.test(id_card)) {
    return res.status(400).json({ message: "ID card must be 9-12 digits" });
  }

  next();
};

router.get("/profile", verifyToken, userController.getUserProfile);
router.put(
  "/edit-profile",
  verifyToken,
  upload.single("avatar"),
  editLimiter,
  editProfileRules,
  userController.updateUserProfile,
);

export default router;
