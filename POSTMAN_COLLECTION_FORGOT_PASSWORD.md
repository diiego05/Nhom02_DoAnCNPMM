# Postman Collection for Forgot Password API

## Base URL

    http://localhost:8088

## Environment Variables

Tạo environment với các biến:

- `base_url`: `http://localhost:8088`
- `reset_token`: (sẽ được lưu sau khi verify-otp thành công)

---

## 1. GỬI MÃ OTP

**POST** `/auth/forgot-password/send-otp`

**Body (raw JSON):**

    {
      "email": "user1@example.com"
    }

**Response (200):**

    {
      "status": 200,
      "message": "OTP has been sent to your email. Please check your inbox."
    }

---

## 2. NHẬP SAI OTP

**POST** `/auth/forgot-password/verify-otp`

**Body (raw JSON):**

    {
      "email": "user1@example.com",
      "otp_code": "000000"
    }

**Response (400):**

    {
      "status": 400,
      "message": "Invalid OTP. You have 2 attempt(s) remaining."
    }

---

## 3. NHẬP SAI OTP QUÁ 3 LẦN

**POST** `/auth/forgot-password/verify-otp`

**Body (raw JSON):**

    {
      "email": "user1@example.com",
      "otp_code": "000000"
    }

**Response (423):**

    {
      "status": 423,
      "message": "Invalid OTP. You have exceeded the maximum attempts. OTP is locked for 15 minutes. A security alert has been sent to your email."
    }

---

## 4. XÁC THỰC OTP ĐÚNG

**POST** `/auth/forgot-password/verify-otp`

**Body (raw JSON):**

    {
      "email": "user1@example.com",
      "otp_code": "949642"
    }

**Response (200):**

    {
      "status": 200,
      "message": "OTP verified successfully.",
      "data": {
        "reset_token": "MToxNzc4MzkzNzI5NDc1OmE0ZjI4NDBhMzMzMGUxMGZmZjdiMzRhMDhhZjI0NjI5YzA1MDhkMDQ0MzM4OTFkYzA2ZjU0YjllOTc2MTM3ZTM"
      }
    }

**Test Script (để lưu reset_token):**

    if (pm.response.code === 200) {
        pm.environment.set("reset_token", pm.response.json().data.reset_token);
    }

---

## 5. RESET TOKEN GIẢ MẠO

**POST** `/auth/forgot-password/reset-password`

**Body (raw JSON):**

    {
      "reset_token": "MToxNzc4MzkzNzI5NDc1OmE0ZjI4NDBhMzMzMGUxMGZmZjdiMzRhMDhhZjI0NjI5YzA1MDhkMDQ0MzM4OTFkYzA2ZjU0YjllOTc2MTM3Z",
      "new_password": "NewPass@123",
      "confirm_password": "NewPass@456"
    }

**Response (400):**

    {
      "status": 400,
      "message": "Invalid or tampered reset token."
    }

---

## 6. CONFIRM PASSWORD SAI

**POST** `/auth/forgot-password/reset-password`

**Body (raw JSON):**

    {
      "reset_token": "{{reset_token}}",
      "new_password": "NewPass@123",
      "confirm_password": "NewPass@456"
    }

**Response (400):**

    {
      "status": 400,
      "message": "Passwords do not match. Please re-enter."
    }

---

## 7. PASSWORD KHÔNG ĐÚNG POLICY

**POST** `/auth/forgot-password/reset-password`

**Body (raw JSON):**

    {
      "reset_token": "{{reset_token}}",
      "new_password": "newpass@123",
      "confirm_password": "newpass@123"
    }

**Response (400):**

    {
      "status": 400,
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#^()_+=-). Please re-enter."
    }

---

## 8. ĐỔI PASSWORD THÀNH CÔNG

**POST** `/auth/forgot-password/reset-password`

**Body (raw JSON):**

    {
      "reset_token": "{{reset_token}}",
      "new_password": "NewPass@123",
      "confirm_password": "NewPass@123"
    }

**Response (200):**

    {
      "status": 200,
      "message": "Password changed successfully."
    }

---

## Thứ tự test khuyến nghị

1. **Gửi mã OTP** - Nhập email hợp lệ để nhận OTP
2. **Nhập sai OTP** - Nhập OTP sai để kiểm tra đếm attempt
3. **Nhập sai OTP quá 3 lần** - Kiểm tra khoá tạm thời và gửi mail cảnh báo
4. **Xác thực OTP đúng** - Nhập đúng OTP để lấy reset_token
5. **Reset token giả mạo** - Kiểm tra bảo mật token
6. **Confirm password sai** - Kiểm tra validate confirm password
7. **Password không đúng policy** - Kiểm tra password policy
8. **Đổi password thành công** - Đổi mật khẩu với dữ liệu hợp lệ

---

## Password Policy

Mật khẩu phải đáp ứng **tất cả** các yêu cầu:

| Yêu cầu | Ví dụ hợp lệ |
|---|---|
| Tối thiểu 8 ký tự | `NewPass@1` |
| Ít nhất 1 chữ hoa | `N` |
| Ít nhất 1 chữ thường | `ew` |
| Ít nhất 1 chữ số | `1` |
| Ít nhất 1 ký tự đặc biệt | `@` |

Ký tự đặc biệt được chấp nhận: `@ $ ! % * ? & # ^ ( ) _ + = -`

---

## HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 400 | Input không hợp lệ / token giả mạo |
| 410 | OTP hoặc reset token hết hạn |
| 423 | OTP bị khoá do sai quá 3 lần |
| 429 | Quá nhiều request (rate limit) |
| 500 | Lỗi server |

---

## Lưu ý quan trọng

1. **OTP hết hạn sau 5 phút** kể từ khi gửi
2. **OTP bị khoá 15 phút** sau khi nhập sai 3 lần liên tiếp
3. **Reset token hết hạn sau 10 phút** kể từ khi verify OTP thành công
4. **Rate limit gửi OTP:** tối đa 5 lần / 15 phút / IP
5. **Rate limit verify OTP:** tối đa 10 lần / 15 phút / IP
6. Sau khi đổi mật khẩu thành công, **toàn bộ refresh token cũ bị vô hiệu hoá**

---

## Import Collection vào Postman

1. Copy nội dung file JSON collection
2. Mở Postman → **Import** → **Raw text** → Paste JSON
3. Tạo environment với biến `base_url` = `http://localhost:8088`
4. Chạy các request theo thứ tự khuyến nghị
