import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import db from "../models/index.js";
import { sendRegistrationOtp } from "../utils/emailService.js";

const register = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, phone, password, fullName, role_id } = data;

      // Check if user already exists
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ email }, { phone }],
        },
      });

      if (existingUser) {
        return resolve({
          status: 400,
          message: "Email or phone already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await db.User.create({
        email,
        phone,
        password: hashedPassword,
        role_id: role_id || 2, // Default to user role
        status: "PENDING",
      });

      // Split fullName into first_name and last_name
      let firstName = "";
      let lastName = "";
      if (fullName) {
        const parts = fullName.trim().split(" ");
        if (parts.length > 1) {
          firstName = parts.pop();
          lastName = parts.join(" ");
        } else {
          firstName = parts[0];
        }
      }

      // Create profile
      await db.UserProfile.create({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
      });

      // Generate OTP for account activation
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      console.log(`Generating OTP for ${email}: ${otpCode}`);

      await db.OtpVerification.create({
        user_id: user.id,
        otp_code: otpCode,
        type: "ACCOUNT_ACTIVATION",
        expired_at: expiredAt,
      });

      // Send OTP email
      console.log(`Sending registration OTP to ${email}...`);
      sendRegistrationOtp(email, otpCode)
        .then(() => console.log(`OTP email sent successfully to ${email}`))
        .catch((err) =>
          console.error(`Failed to send registration OTP to ${email}:`, err)
        );

      resolve({
        status: 201,
        message: "User registered successfully. Please check your email for OTP.",
        data: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const login = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email_or_phone, password } = data;

      // Find user by email or phone
      const user = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { email: email_or_phone },
            { phone: email_or_phone },
          ],
        },
        include: [
          {
            model: db.Role,
            as: "role",
          },
        ],
      });

      if (!user) {
        return resolve({
          status: 401,
          message: "User not found",
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return resolve({
          status: 401,
          message: "Wrong password",
        });
      }

      // Check user status
      if (user.status !== "ACTIVE") {
        return resolve({
          status: 403,
          message: "Account is not active",
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
      });

      // Save refresh token to database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await db.RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
        is_revoked: false,
      });
      let redirectUrl = "user/profile";
      if (user.role_id === 1 || user.role?.role_name === "admin") {
        redirectUrl = "admin/profile";
      }
      resolve({
        status: 200,
        message: "Login success",
        data: {
          accessToken,
          refreshToken,
          redirectUrl,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role?.role_name,
          },
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const refreshToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find refresh token in database
      const refreshTokenRecord = await db.RefreshToken.findOne({
        where: {
          token: token,
          is_revoked: false,
          expires_at: {
            [db.Sequelize.Op.gt]: new Date(),
          },
        },
      });

      if (!refreshTokenRecord) {
        return resolve({
          status: 403,
          message: "Invalid or expired refresh token",
        });
      }

      // Revoke old token
      await refreshTokenRecord.update({ is_revoked: true });

      // Get user
      const user = await db.User.findByPk(refreshTokenRecord.user_id);

      if (!user) {
        return resolve({
          status: 404,
          message: "User not found",
        });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role_id: user.role_id,
      });

      const newRefreshToken = generateRefreshToken({
        id: user.id,
      });

      // Save new refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await db.RefreshToken.create({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: expiresAt,
        is_revoked: false,
      });

      resolve({
        status: 200,
        message: "Token refreshed",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

const verifyAccountOtp = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, otpCode } = data;

      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        return resolve({ status: 404, message: "User not found" });
      }

      const otpRecord = await db.OtpVerification.findOne({
        where: {
          user_id: user.id,
          type: "ACCOUNT_ACTIVATION",
          is_used: false,
          otp_code: otpCode,
        },
        order: [["created_at", "DESC"]],
      });

      if (!otpRecord) {
        return resolve({ status: 400, message: "Invalid OTP code" });
      }

      if (new Date() > new Date(otpRecord.expired_at)) {
        return resolve({ status: 410, message: "OTP code expired" });
      }

      // Update user status and OTP record
      await user.update({ status: "ACTIVE" });
      await otpRecord.update({ is_used: true });

      resolve({
        status: 200,
        message: "Account verified successfully",
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  register,
  login,
  refreshToken,
  verifyAccountOtp,
};
