import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/DBConfig.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import authRouter from "./routes/authRoute.js";
import forgotPasswordRoute from "./routes/forgotPasswordRoute.js";
import productRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import addressRouter from "./routes/addressRoute.js";
import shopRouter from "./routes/shopRoute.js";
import brandRouter from "./routes/brandRoute.js";
import chatRouter from "./routes/chatRoute.js";
import cron from "node-cron";
import orderService from "./services/orderService.js";
import morgan from "morgan";

let app = express();
app.use(morgan("dev"));

// Giữ error handlers từ HEAD cho production safety
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

// Dùng origin: true từ nhánh di (cho phép tất cả origin) thay vì chỉ localhost:5173
app.use(cors({ origin: true, credentials: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use("/public", express.static("src/public"));

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/auth/forgot-password", forgotPasswordRoute);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/addresses", addressRouter);
app.use("/shops", shopRouter);
app.use("/brands", brandRouter);
app.use("/chats", chatRouter);

let port = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("Backend nodejs is running on the port: " + port);

      // Khởi động Cron Job kiểm tra đơn hàng tự động xác nhận sau 30 phút
      cron.schedule("* * * * *", async () => {
        try {
          const updatedCount = await orderService.autoConfirmOrders();
          if (updatedCount > 0) {
            console.log(
              `[CRON] Tự động xác nhận ${updatedCount} đơn hàng thành công.`,
            );
          }
        } catch (error) {
          console.error("[CRON] Lỗi khi chạy auto confirm orders:", error);
        }
      });
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  });
