# 🌐 Tổng hợp Danh sách URL dự án (Nhom02_DoAnCNPMM)

Tài liệu này tổng hợp toàn bộ các đường dẫn (URL) của hệ thống bao gồm cả **Frontend (Giao diện React)** và **Backend (API NodeJS/Express)**.

---

## 🖥️ 1. Frontend Route (React Client)
Giao diện người dùng chạy ở Client-side (thông qua React Router). Địa chỉ mặc định: `http://localhost:5173`.

### 🔓 Trang Công Cộng (Public Routes)
Các trang này mọi người dùng hoặc khách vãng lai đều có thể truy cập mà không cần đăng nhập.

| Đường dẫn (URL) | Component trang | Layout sử dụng | Mô tả |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | `MainLayout` | Trang chủ của hệ thống. |
| `/products` | `ProductListPage` | `MainLayout` | Danh sách sản phẩm, hỗ trợ tìm kiếm, lọc. |
| `/products/:id` | `ProductDetailPage` | `MainLayout` | Trang thông tin chi tiết một sản phẩm cụ thể. |
| `/shop/:id` | `VendorShopPage` | `MainLayout` | Trang cửa hàng của người bán (Vendor). |
| `/cart` | `CartPage` | `MainLayout` | Giỏ hàng của người dùng. |

### 🔑 Xác thực & Tài khoản (Auth Routes)
Các trang xử lý đăng nhập, đăng ký và lấy lại mật khẩu.

| Đường dẫn (URL) | Component trang | Layout sử dụng | Mô tả |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `Login` | `AuthLayout` | Trang đăng nhập hệ thống. |
| `/auth/register` | `Register` | `AuthLayout` | Trang đăng ký tài khoản mới. |
| `/auth/verify-otp` | `VerifyOTP` | `AuthLayout` | Xác thực OTP để hoàn tất đăng ký. |
| `/auth/forgot-password`| `ForgotPassword` | `AuthLayout` | Khôi phục mật khẩu khi quên. |
| `/auth/logout` | | | Đường dẫn kích hoạt hành động Đăng xuất. |

### 🔒 Trang Cần Đăng Nhập (Protected Routes)
Yêu cầu người dùng đăng nhập mới có thể truy cập (được bảo vệ bởi `AuthGuard`).

| Đường dẫn (URL) | Component trang | Phân quyền truy cập | Mô tả |
| :--- | :--- | :--- | :--- |
| `/profile` | `Profile` | Bất kỳ tài khoản nào đã đăng nhập | Quản lý và chỉnh sửa thông tin cá nhân. |
| `/checkout` | `CheckoutPage` | Khách hàng (`USER`) | Trang nhập địa chỉ và đặt hàng. |
| `/orders` | `OrderHistoryPage` | Khách hàng (`USER`) | Danh sách lịch sử đơn hàng đã mua. |
| `/orders/:id` | `OrderDetailPage` | Khách hàng (`USER`) | Xem chi tiết thông tin và trạng thái đơn hàng. |
| `/reviews` | `ReviewPage` | Khách hàng (`USER`) | Giao diện đánh giá sản phẩm sau khi mua. |
| `/vendor` | `VendorDashboard` | Nhà bán hàng (`VENDOR`) | Trang quản trị của Nhà bán hàng. |
| `/manager` | `ManagerDashboard` | Quản lý (`MANAGER`) | Trang quản trị của Quản lý / Shipper Manager. |
| `/admin` | `AdminDashboard` | Quản trị viên (`ADMIN`) | Trang cấu hình và quản trị hệ thống tối cao. |

---

## ⚙️ 2. Backend API Route (NodeJS / Express)
Các API cung cấp dữ liệu cho Frontend, chạy ở cổng: `http://localhost:8088`.

### 🔑 Xác thực & Bảo mật (`/auth`)
Quản lý đăng ký, đăng nhập và xác thực.

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `POST` | `/auth/register` | `verifyRecaptcha` | Đăng ký tài khoản (hỗ trợ bảo mật ReCAPTCHA). |
| `POST` | `/auth/verify-otp` | Không | Xác nhận mã OTP đăng ký. |
| `POST` | `/auth/login` | `authLimiter` (giới hạn 6 lần) | Đăng nhập tài khoản. |
| `POST` | `/auth/refresh` | Không | Cấp lại Access Token mới từ Refresh Token. |
| `POST` | `/auth/logout` | Không | Đăng xuất, vô hiệu hóa phiên. |
| `POST` | `/auth/google` | Không | Đăng nhập nhanh bằng tài khoản Google. |

### 📧 Khôi phục Mật khẩu (`/auth/forgot-password`)
Các API liên quan đến quy trình quên mật khẩu.

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `POST` | `/auth/forgot-password/send-otp` | `sendOtpLimiter` (max 5) | Gửi OTP khôi phục mật khẩu vào Email. |
| `POST` | `/auth/forgot-password/resend-otp`| `sendOtpLimiter` (max 5) | Gửi lại mã OTP mới. |
| `POST` | `/auth/forgot-password/verify-otp`| `verifyOtpLimiter` (max 10) | Xác thực mã OTP người dùng nhập. |
| `POST` | `/auth/forgot-password/reset-password`| `resetPasswordLimiter` | Đặt lại mật khẩu mới. |

### 👤 Thông tin người dùng (`/user`)
Quản lý thông tin cá nhân.

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/user/profile` | `verifyToken` | Lấy chi tiết thông tin cá nhân hiện tại. |
| `PUT` | `/user/edit-profile` | `verifyToken`, `editLimiter`, upload avatar | Cập nhật thông tin cá nhân & tải lên avatar mới. |

### 🏷️ Sản phẩm (`/products`)
Lấy thông tin và hiển thị danh sách sản phẩm.

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/products` | Không | Lấy danh sách sản phẩm (hỗ trợ phân trang, lọc, sắp xếp). |
| `GET` | `/products/featured` | Không | Lấy danh sách các sản phẩm nổi bật. |
| `GET` | `/products/newest` | Không | Lấy các sản phẩm mới nhất. |
| `GET` | `/products/best-sellers`| Không | Lấy các sản phẩm bán chạy nhất. |
| `GET` | `/products/most-viewed`| Không | Lấy sản phẩm có lượt xem cao nhất. |
| `GET` | `/products/:slug` | Không | Lấy thông tin chi tiết một sản phẩm qua slug. |
| `GET` | `/products/:slug/similar`| Không | Lấy danh sách sản phẩm tương tự cùng danh mục. |

### 📁 Danh mục (`/categories`)
Thông tin danh mục sản phẩm.

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/categories` | Không | Lấy danh sách toàn bộ danh mục sản phẩm. |
| `GET` | `/categories/:slug` | Không | Xem chi tiết danh mục theo slug. |

### 🛒 Giỏ hàng (`/cart`)
Quản lý sản phẩm được thêm vào giỏ hàng. Yêu cầu đăng nhập (`verifyToken`).

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/cart` | `verifyToken` | Lấy các sản phẩm đang có trong giỏ hàng. |
| `POST` | `/cart/items` | `verifyToken` | Thêm sản phẩm (hoặc cập nhật tăng số lượng) vào giỏ. |
| `PUT` | `/cart/items/:itemId` | `verifyToken` | Cập nhật chính xác số lượng sản phẩm trong giỏ. |
| `DELETE`| `/cart/items/:itemId` | `verifyToken` | Xóa sản phẩm khỏi giỏ hàng. |

### 📦 Đơn hàng (`/orders`)
Quản lý đơn hàng. Yêu cầu đăng nhập (`verifyToken`).

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `POST` | `/orders` | `verifyToken` | Khởi tạo đơn hàng mới (Mua hàng từ giỏ). |
| `GET` | `/orders` | `verifyToken` | Lấy lịch sử đơn hàng của người dùng hiện tại. |
| `GET` | `/orders/:orderId` | `verifyToken` | Xem chi tiết thông tin và trạng thái một đơn hàng. |
| `POST` | `/orders/:orderId/cancel` | `verifyToken` | Hủy đơn hàng. |
| `POST` | `/orders/:orderId/confirm`| `verifyToken` | Xác nhận đơn hàng (Dành cho Admin/Vendor). |

### 📍 Địa chỉ giao hàng (`/addresses`)
Quản lý sổ địa chỉ nhận hàng của người dùng. Yêu cầu đăng nhập (`verifyToken`).

| Phương thức | Đường dẫn API | Middleware bảo vệ | Mô tả |
| :---: | :--- | :--- | :--- |
| `GET` | `/addresses` | `verifyToken` | Lấy danh sách địa chỉ giao hàng của người dùng. |
| `POST` | `/addresses` | `verifyToken` | Thêm một địa chỉ giao hàng mới. |
| `PUT` | `/addresses/:id` | `verifyToken` | Cập nhật địa chỉ hiện tại. |
| `DELETE`| `/addresses/:id` | `verifyToken` | Xóa địa chỉ giao hàng. |
