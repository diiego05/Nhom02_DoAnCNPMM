# UTEShop

UTEShop là nền tảng thương mại điện tử đa gian hàng (Multi-vendor E-commerce) kết nối **Khách hàng**, **Nhà bán hàng (Vendor)**, **Người giao hàng (Shipper)** và **Ban quản trị (Manager/Admin)** trong một hệ sinh thái mua bán trực tuyến hoàn chỉnh.

---

## 👥 Thành viên nhóm

| STT | Họ và Tên | MSSV |
|:---:|-----------|------|
| 1 | Lâm Văn Dỉ | 23110191 |
| 2 | Nguyễn Hoàng Anh Kiệt | 23110247 |
| 3 | Nguyễn Trí Lâm | 23110250 |
| 4 | Trần Thành Trung | 23110351 |

---

## Giới thiệu đồ án

**UTEShop** được xây dựng theo mô hình sàn thương mại điện tử đa bên (Multi-sided Platform), cho phép nhiều nhà bán hàng cùng kinh doanh trên một nền tảng duy nhất. Hệ thống bao gồm đầy đủ các nghiệp vụ cốt lõi:

- **36 Use Cases** được đặc tả và triển khai hoàn chỉnh theo quy trình phần mềm chuẩn.
- **5 vai trò người dùng** với giao diện và quyền hạn phân tách rõ ràng: **Guest, Customer, Vendor, Shipper, Manager, Admin**.
- **Luồng dòng tiền khép kín**: Khách hàng đặt hàng → Shipper thu COD → Admin đối soát → Ví Vendor → Rút tiền ngân hàng.
- **Tích hợp thực tế**: Cổng thanh toán **VNPAY**, lưu trữ ảnh **Cloudinary**, gửi **Email OTP** xác thực, đăng nhập **Google OAuth2**, mã **VietQR** tự động khi rút tiền.

---

## Công nghệ sử dụng

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| **Node.js** + **Express.js v5** | Máy chủ RESTful API |
| **Sequelize ORM** + **MySQL** | Cơ sở dữ liệu quan hệ |
| **JWT** (jsonwebtoken) | Xác thực & phân quyền Access/Refresh Token |
| **bcryptjs** | Mã hóa mật khẩu |
| **Nodemailer** | Gửi Email OTP qua SMTP Gmail |
| **Cloudinary** + **Multer** | Upload & lưu trữ ảnh sản phẩm, avatar |
| **Google Auth Library** | Đăng nhập qua tài khoản Google (OAuth2) |
| **node-cron** | Lập lịch tác vụ tự động (cron job) |
| **VNPAY SDK** | Tích hợp cổng thanh toán trực tuyến |
| **express-rate-limit** | Giới hạn tốc độ yêu cầu API |
| **morgan** | Ghi log HTTP request |
| **Redis** | Cache dữ liệu, lưu trữ OTP & Refresh Token |

### Frontend
| Công nghệ | Mô tả |
|-----------|-------|
| **React 19** + **TypeScript** | Giao diện người dùng SPA |
| **Vite** | Công cụ build siêu tốc |
| **Tailwind CSS v4** | Framework CSS tiện ích |
| **Redux Toolkit** + **redux-persist** | Quản lý trạng thái toàn cục (Global State) |
| **TanStack Query (React Query)** | Quản lý trạng thái dữ liệu từ server |
| **React Router DOM v7** | Định tuyến phía client |
| **React Hook Form** + **Yup** | Quản lý form và kiểm tra dữ liệu |
| **Recharts** | Vẽ biểu đồ thống kê doanh thu |
| **Lucide React** | Thư viện icon |
| **react-hot-toast** + **Sonner** | Thông báo Toast |
| **Swiper** | Carousel / Slider sản phẩm |
| **@react-oauth/google** | Nút đăng nhập Google |
| **Playwright** | Kiểm thử End-to-End (E2E) |

### Dịch vụ & Công cụ
| Công cụ | Mục đích |
|---------|----------|
| **MySQL** (port 3306) | Hệ quản trị cơ sở dữ liệu |
| **Cloudinary** | CDN lưu trữ hình ảnh |
| **VNPAY Sandbox** | Môi trường thử nghiệm thanh toán |
| **VietQR API** | Tạo mã QR chuyển khoản ngân hàng tự động |
| **Google reCAPTCHA v2** | Chống bot trong các form quan trọng |
| **Postman** | Kiểm thử API (Collections có sẵn) |
| **Sequelize CLI** | Quản lý migration và seed dữ liệu |
| **Git** / **GitHub** | Quản lý mã nguồn |

---

## Cấu trúc thư mục

```
Nhom02_DoAnCNPMM/
├── backend/                  # Máy chủ Node.js + Express
│   ├── src/
│   │   ├── app.js            # Điểm khởi động
│   │   ├── controllers/      # Xử lý request HTTP
│   │   ├── services/         # Logic nghiệp vụ
│   │   ├── models/           # Model Sequelize (40+ models)
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Xác thực, phân quyền RBAC
│   │   ├── utils/            # Hàm tiện ích (JWT, Email, VNPay...)
│   │   ├── database/         # Schema SQL
│   │   ├── migrations/       # Migration Sequelize
│   │   ├── seeders/          # Dữ liệu mẫu
│   │   └── postman/          # Bộ kiểm thử API
│   ├── .env.example
│   ├── .sequelizerc
│   └── package.json
│
├── frontend/                 # Giao diện React + TypeScript
│   ├── src/
│   │   ├── pages/            # auth/ shop/ user/ vendor/ shipper/ manager/ admin/
│   │   ├── components/       # layout/ ui/ chat/
│   │   ├── services/         # Gọi API với Axios (19 modules)
│   │   ├── stores/           # Redux Store & Slices
│   │   ├── hooks/            # Custom React Hooks
│   │   └── routes.tsx        # Định nghĩa toàn bộ routes
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json        
└── README.md
```

---



## ⚙️ Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống

| Công cụ | Phiên bản khuyến nghị |
|---------|-----------------------|
| **Node.js** | v18.x trở lên |
| **npm** | v9.x trở lên |
| **MySQL** | v8.0 trở lên |
| **Git** | Phiên bản mới nhất |

---

### Bước 1: Clone dự án về máy

```bash
git clone https://github.com/diiego05/Nhom02_DoAnCNPMM.git
cd Nhom02_DoAnCNPMM
```

---

### Bước 2: Cấu hình Backend

#### 2.1. Cài đặt dependencies

```bash
cd backend
npm install
```

#### 2.2. Tạo file biến môi trường

File mẫu `.env.example` đã có sẵn trong thư mục `backend/`. Sao chép nó và điền giá trị thực tế:

```bash
cp .env.example .env
```

Sau đó mở file `.env` vừa tạo và điền các thông tin cần thiết (xem hướng dẫn trong `backend/.env.example`).


#### 2.3. Khởi tạo cơ sở dữ liệu

> Đảm bảo MySQL đang chạy và tài khoản có đủ quyền tạo database.

```bash
# Chạy toàn bộ: xóa DB cũ → tạo mới → migrate → seed dữ liệu mẫu
npm run db:reset
```

Hoặc chạy từng bước:

```bash
npx sequelize-cli db:create       # Tạo database
npx sequelize-cli db:migrate      # Chạy migrations tạo bảng
npx sequelize-cli db:seed:all     # Chèn dữ liệu mẫu
```

#### 2.4. Khởi động Backend

```bash
npm run dev
```

> Backend sẽ chạy tại: **http://localhost:8088**

---

### Bước 3: Cấu hình Frontend

#### 3.1. Cài đặt dependencies

```bash
# Mở terminal mới, từ thư mục gốc dự án
cd frontend
npm install
```

#### 3.2. Tạo file biến môi trường

File mẫu `.env.example` đã có sẵn trong thư mục `frontend/`. Sao chép nó và điền giá trị thực tế:

```bash
cp .env.example .env
```

Sau đó mở file `.env` vừa tạo và điền các thông tin cần thiết (xem hướng dẫn trong `frontend/.env.example`).


#### 3.3. Khởi động Frontend

```bash
npm run dev
```

> Frontend sẽ chạy tại: **http://localhost:5173**

---

### Bước 4: Truy cập hệ thống

Mở trình duyệt và truy cập **http://localhost:5173**

#### Tài khoản demo mặc định (sau khi seed dữ liệu):

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| **Admin** | `admin@uteshop.vn` | `123456` |
| **Manager** | `manager@uteshop.vn` | `123456` |
| **Vendor** | `vendor@gmail.com` | `123456` |
| **Shipper** | `shipper@gmail.com` | `123456` |
| **Customer** | `customer@gmail.com` | `123456` |

---

<div align="center">
  <p>© 2026 UTEShop — Nhóm 2 </p>
</div>
