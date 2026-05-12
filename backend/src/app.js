import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/DBConfig.js";
import "dotenv/config";
import userRouter from "./route/userRoute.js";
import authRouter from "./route/authRoute.js";
import forgotPasswordRoute from "./route/forgotPasswordRoute.js";

let app = express();

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use("/public", express.static("src/public"));

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/auth/forgot-password", forgotPasswordRoute);

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
