import "dotenv/config";
import express from "express"; // Restart

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/DBConfig.js";
import userRouter from "./routes/userRoute.js";
import authRouter from "./routes/authRoute.js";
import forgotPasswordRoute from "./routes/forgotPasswordRoute.js";
import productRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import addressRouter from "./routes/addressRoute.js";
import couponRouter from "./routes/couponRoute.js";
import shopRouter from "./routes/shopRoute.js";
import chatRouter from "./routes/chatRoute.js";
import adminRouter from "./routes/adminRoute.js";
import systemRouter from "./routes/systemRoute.js";
import managerRouter from "./routes/managerRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import returnRouter from "./routes/returnRoute.js";
import blogRouter from "./routes/blogRoute.js";
import aiChatRouter from "./routes/aiChatRoute.js";
import shipmentRouter from "./routes/shipmentRoutes.js";
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
app.use("/coupons", couponRouter);
app.use("/shops", shopRouter);
app.use("/chats", chatRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);
app.use("/notifications", notificationRouter);
app.use("/payment", paymentRouter);
app.use("/system", systemRouter);
app.use("/returns", returnRouter);
app.use("/", blogRouter);
app.use("/", aiChatRouter);
app.use("/shipments", shipmentRouter);

app.get("/brands", (req, res) => {
  return res.status(200).json({
    message: "Success",
    data: [
      { id: 1, name: "Nike" },
      { id: 2, name: "Adidas" },
      { id: 3, name: "Puma" },
      { id: 4, name: "New Balance" },
      { id: 5, name: "UTEShop Original" },
    ],
  });
});

let port = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("Backend nodejs is running on the port: " + port);
    });

    // Auto-complete delivered orders every 5 minutes
    cron.schedule("*/5 * * * *", () => {
      console.log("Running auto-completion check for delivered orders...");
      orderService.autoCompleteDeliveredOrders();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  });
