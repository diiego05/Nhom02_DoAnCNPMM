import multer from "multer";
import path from "path";
import fs from "fs";

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "src/public/uploads/avatars";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: user_id-timestamp.extension
    const userId = req.user ? req.user.id : "unknown";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpg, jpeg, png) are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter,
});

export default upload;
