import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/DBConfig.js";
import "dotenv/config";
import userRouter from "./route/userRoute.js";
import authRouter from "./route/authRoute.js";
import forgotPasswordRoute from "./route/forgotPasswordRoute.js";
import productRouter from "./route/productRoute.js";
import categoryRouter from "./route/categoryRoute.js";

let app = express();

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

let port = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("Backend nodejs is running on the port: " + port);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  });
