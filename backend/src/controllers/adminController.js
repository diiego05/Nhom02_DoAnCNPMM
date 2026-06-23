import adminService from "../services/adminService.js";

// ============================================================
// 1. QUẢN LÝ TÀI KHOẢN MANAGER
// ============================================================

const createUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    const user = await adminService.createUser(adminId, { email, password, full_name, role });
    return res.status(201).json({ message: `Tạo tài khoản thành công`, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(400).json({ message: error.message || "Lỗi tạo tài khoản" });
  }
};

const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role || "user"; // default to user
    const users = await adminService.getUsersByRole(role);
    return res.status(200).json({ message: "Success", data: users });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const lockUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    await adminService.lockUser(adminId, id);
    return res.status(200).json({ message: "Khóa tài khoản thành công" });
  } catch (error) {
    console.error("Error locking user:", error);
    return res.status(400).json({ message: error.message || "Lỗi khóa tài khoản" });
  }
};

const unlockUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    await adminService.unlockUser(adminId, id);
    return res.status(200).json({ message: "Mở khóa tài khoản thành công" });
  } catch (error) {
    console.error("Error unlocking user:", error);
    return res.status(400).json({ message: error.message || "Lỗi mở khóa tài khoản" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, full_name, gender, birthday, password } = req.body;
    let { avatar_url } = req.body;

    if (req.file) {
      avatar_url = req.file.path;
    }

    const user = await adminService.updateUserProfileByAdmin(id, { 
      email, 
      phone, 
      full_name, 
      gender, 
      birthday, 
      password,
      avatar_url 
    });

    return res.status(200).json({ message: "Cập nhật thông tin tài khoản thành công", data: user });
  } catch (error) {
    console.error("Error updating user profile by admin:", error);
    return res.status(400).json({ message: error.message || "Lỗi cập nhật thông tin tài khoản" });
  }
};


// ============================================================
// 2. PHÊ DUYỆT / TỪ CHỐI GIAN HÀNG
// ============================================================

const getAllShops = async (req, res) => {
  try {
    const { status } = req.query;
    const shops = await adminService.getAllShops(status);
    return res.status(200).json({ message: "Success", data: shops });
  } catch (error) {
    console.error("Error getting shops:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPendingShops = async (req, res) => {
  try {
    const shops = await adminService.getPendingShops();
    return res.status(200).json({ message: "Success", data: shops });
  } catch (error) {
    console.error("Error getting pending shops:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const approveShop = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const shop = await adminService.approveShop(adminId, id);
    return res.status(200).json({ message: "Phê duyệt gian hàng thành công", data: shop });
  } catch (error) {
    console.error("Error approving shop:", error);
    return res.status(400).json({ message: error.message || "Lỗi phê duyệt gian hàng" });
  }
};

const rejectShop = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;
    const shop = await adminService.rejectShop(adminId, id, reason);
    return res.status(200).json({ message: "Từ chối gian hàng thành công", data: shop });
  } catch (error) {
    console.error("Error rejecting shop:", error);
    return res.status(400).json({ message: error.message || "Lỗi từ chối gian hàng" });
  }
};


// ============================================================
// 3. CẤU HÌNH HỆ THỐNG
// ============================================================

const getSystemSettings = async (req, res) => {
  try {
    const settings = await adminService.getSystemSettings();
    return res.status(200).json({ message: "Success", data: settings });
  } catch (error) {
    console.error("Error getting settings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSystemSetting = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ message: "Giá trị cấu hình không được để trống" });
    }

    const setting = await adminService.updateSystemSetting(adminId, key, value);
    return res.status(200).json({ message: "Cập nhật cấu hình thành công", data: setting });
  } catch (error) {
    console.error("Error updating setting:", error);
    return res.status(400).json({ message: error.message || "Lỗi cập nhật cấu hình" });
  }
};

// Danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await adminService.getCategoriesAdmin();
    return res.status(200).json({ message: "Success", data: categories });
  } catch (error) {
    console.error("Error getting categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await adminService.createCategory(req.body);
    return res.status(201).json({ message: "Tạo danh mục thành công", data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(400).json({ message: error.message || "Lỗi tạo danh mục" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await adminService.updateCategory(id, req.body);
    return res.status(200).json({ message: "Cập nhật danh mục thành công", data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(400).json({ message: error.message || "Lỗi cập nhật danh mục" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteCategory(id);
    return res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(400).json({ message: error.message || "Lỗi xóa danh mục" });
  }
};


// ============================================================
// 4. BÁO CÁO TÀI CHÍNH
// ============================================================

const getFinancialReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const report = await adminService.getFinancialReport(from, to);
    return res.status(200).json({ message: "Success", data: report });
  } catch (error) {
    console.error("Error getting financial report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ============================================================
// 5. ĐỐI SOÁT THANH TOÁN
// ============================================================

const getPaymentReconciliation = async (req, res) => {
  try {
    const data = await adminService.getPaymentReconciliation();
    return res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("Error getting reconciliation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const approveShopPayout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const payout = await adminService.approveShopPayout(adminId, id);
    return res.status(200).json({ message: "Duyệt lệnh chuyển tiền thành công", data: payout });
  } catch (error) {
    console.error("Error approving payout:", error);
    return res.status(400).json({ message: error.message || "Lỗi duyệt lệnh thanh toán" });
  }
};


// ============================================================
// 6. LỊCH SỬ THANH TOÁN (PAYMENT LOGS)
// ============================================================

const getPaymentLogs = async (req, res) => {
  try {
    const { page, limit, gateway_name, status, search, from_date, to_date } = req.query;
    const data = await adminService.getPaymentLogs(page, limit, { gateway_name, status, search, from_date, to_date });
    return res.status(200).json({ message: "Success", data });
  } catch (error) {
    console.error("Error getting payment logs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export default {
  createUser,
  getUsersByRole,
  updateUserProfile,
  lockUser,
  unlockUser,
  getAllShops,
  getPendingShops,
  approveShop,
  rejectShop,
  getSystemSettings,
  updateSystemSetting,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getFinancialReport,
  getPaymentReconciliation,
  approveShopPayout,
  getPaymentLogs,
};
