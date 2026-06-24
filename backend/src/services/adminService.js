import db from "../models/index.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sendShipperAccountCreated } from "../utils/emailService.js";
import notificationService from "./notificationService.js";

// ============================================================
// 1. QUẢN LÝ TÀI KHOẢN MANAGER
// ============================================================

const createUser = async (adminId, { email, password, full_name, role, phone, gender, shipper_shop_id }) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Kiểm tra email đã tồn tại
    const existingUser = await db.User.findOne({ where: { email }, transaction });
    if (existingUser) throw new Error("Email đã được sử dụng");

    // Map customer -> user
    let targetRoleName = role || "manager";
    if (targetRoleName === "customer") {
      targetRoleName = "user";
    }

    // Kiểm tra số điện thoại đã tồn tại
    if (phone) {
      const existingPhone = await db.User.findOne({ where: { phone }, transaction });
      if (existingPhone) throw new Error("Số điện thoại đã được sử dụng");
    }

    // Tìm role
    const dbRole = await db.Role.findOne({ where: { role_name: targetRoleName }, transaction });
    if (!dbRole) throw new Error(`Không tìm thấy vai trò ${role} trong hệ thống`);

    // Tạo mật khẩu ngẫu nhiên cho shipper
    let finalPassword = password;
    if (targetRoleName === "shipper") {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      finalPassword = "";
      for (let i = 0; i < 8; i++) {
        finalPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    if (!finalPassword) {
      throw new Error("Mật khẩu là bắt buộc");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    // Tạo user
    const user = await db.User.create({
      email,
      phone: phone || null,
      password: hashedPassword,
      role_id: dbRole.id,
      status: "ACTIVE",
      auth_provider: "local",
    }, { transaction });

    // Tạo profile
    await db.UserProfile.create({
      user_id: user.id,
      full_name: full_name || null,
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150",
      gender: gender || null,
      shipper_shop_id: shipper_shop_id || null,
    }, { transaction });

    // Nếu role là vendor, tạo thêm shop mặc định
    if (targetRoleName === "vendor") {
      await db.Shop.create({
        vendor_id: user.id,
        shop_name: `Shop của ${full_name || email.split("@")[0]}`,
        shop_logo: "https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=150",
        description: `Cửa hàng của ${full_name || email.split("@")[0]}`,
        status: "APPROVED",
      }, { transaction });
    }

    await transaction.commit();

    // Gửi thông báo cho Admin (chính chủ)
    if (adminId) {
      try {
        await notificationService.createNotification(
          adminId,
          "Tạo tài khoản thành công",
          `Bạn đã tạo thành công tài khoản email ${email} vai trò ${targetRoleName}.`,
          "USER_MANAGEMENT"
        );
      } catch (notifErr) {
        console.error("Failed to create admin create user notification:", notifErr);
      }
    }

    // Gửi email cho shipper sau khi commit thành công
    if (targetRoleName === "shipper") {
      try {
        await sendShipperAccountCreated(email, full_name, finalPassword);
      } catch (emailError) {
        console.error("Failed to send shipper creation email:", emailError);
      }
    }

    return {
      id: user.id,
      email: user.email,
      full_name,
      role: targetRoleName,
      status: user.status,
      created_at: user.created_at,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUsersByRole = async (roleName) => {
  let targetRoleName = roleName;
  if (targetRoleName === "customer") {
    targetRoleName = "user";
  }

  const role = await db.Role.findOne({ where: { role_name: targetRoleName } });
  if (!role) return [];

  return await db.User.findAll({
    where: { role_id: role.id },
    attributes: ["id", "email", "phone", "status", "created_at", "updated_at"],
    include: [{
      model: db.UserProfile,
      as: "profile",
      attributes: ["full_name", "avatar_url", "birthday", "gender", "shipper_shop_id"],
      include: [{
        model: db.Shop,
        as: "shipperShop",
        attributes: ["id", "shop_name"],
      }],
    }],
    order: [["created_at", "DESC"]],
  });
};

const lockUser = async (adminId, userId) => {
  const user = await db.User.findByPk(userId, {
    include: [{ model: db.Role, as: "role" }],
  });
  if (!user) throw new Error("Không tìm thấy tài khoản");
  if (user.role.role_name === "admin") throw new Error("Không thể khóa tài khoản Admin");
  if (user.status === "LOCKED") throw new Error("Tài khoản đã bị khóa trước đó");

  await user.update({ status: "LOCKED" });

  // Gửi thông báo cho Admin (chính chủ)
  if (adminId) {
    try {
      await notificationService.createNotification(
        adminId,
        "Khóa tài khoản thành công",
        `Bạn đã khóa thành công tài khoản của người dùng ${user.email}.`,
        "USER_MANAGEMENT"
      );
    } catch (notifErr) {
      console.error("Failed to create admin lock user notification:", notifErr);
    }
  }

  return user;
};

const unlockUser = async (adminId, userId) => {
  const user = await db.User.findByPk(userId, {
    include: [{ model: db.Role, as: "role" }],
  });
  if (!user) throw new Error("Không tìm thấy tài khoản");
  if (user.role.role_name === "admin") throw new Error("Không thể thao tác trên tài khoản Admin");
  if (user.status === "ACTIVE") throw new Error("Tài khoản đang hoạt động bình thường");

  await user.update({ status: "ACTIVE" });

  // Gửi thông báo cho Admin (chính chủ)
  if (adminId) {
    try {
      await notificationService.createNotification(
        adminId,
        "Mở khóa tài khoản thành công",
        `Bạn đã mở khóa thành công tài khoản của người dùng ${user.email}.`,
        "USER_MANAGEMENT"
      );
    } catch (notifErr) {
      console.error("Failed to create admin unlock user notification:", notifErr);
    }
  }

  return user;
};

const updateUserProfileByAdmin = async (userId, { email, phone, full_name, gender, birthday, password, avatar_url }) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user = await db.User.findByPk(userId, { transaction });
    if (!user) throw new Error("Không tìm thấy tài khoản");

    // Cập nhật email nếu thay đổi
    if (email && email !== user.email) {
      const existingEmail = await db.User.findOne({ where: { email }, transaction });
      if (existingEmail) throw new Error("Email đã được sử dụng bởi tài khoản khác");
      await user.update({ email }, { transaction });
    }

    // Cập nhật số điện thoại nếu thay đổi
    if (phone && phone !== user.phone) {
      const existingPhone = await db.User.findOne({ where: { phone }, transaction });
      if (existingPhone) throw new Error("Số điện thoại đã được sử dụng bởi tài khoản khác");
      await user.update({ phone }, { transaction });
    }

    // Cập nhật mật khẩu nếu có
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await user.update({ password: hashedPassword }, { transaction });
    }

    // Cập nhật Profile
    let profile = await db.UserProfile.findOne({ where: { user_id: userId }, transaction });
    if (profile) {
      await profile.update({
        full_name: full_name !== undefined ? full_name : profile.full_name,
        gender: gender !== undefined ? gender : profile.gender,
        birthday: birthday !== undefined ? birthday : profile.birthday,
        avatar_url: avatar_url !== undefined ? avatar_url : profile.avatar_url,
      }, { transaction });
    } else {
      await db.UserProfile.create({
        user_id: userId,
        full_name: full_name || null,
        gender: gender || null,
        birthday: birthday || null,
        avatar_url: avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150",
      }, { transaction });
    }

    await transaction.commit();

    // Lấy lại user và profile đã cập nhật
    return await db.User.findByPk(userId, {
      attributes: ["id", "email", "phone", "status", "created_at", "updated_at"],
      include: [{
        model: db.UserProfile,
        as: "profile",
        attributes: ["full_name", "avatar_url", "birthday", "gender", "shipper_shop_id"],
        include: [{
          model: db.Shop,
          as: "shipperShop",
          attributes: ["id", "shop_name"],
        }],
      }],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


// ============================================================
// 2. PHÊ DUYỆT / TỪ CHỐI GIAN HÀNG VENDOR
// ============================================================

const getAllShops = async (status) => {
  const where = {};
  if (status) where.status = status;

  return await db.Shop.findAll({
    where,
    include: [{
      model: db.User,
      as: "vendor",
      attributes: ["id", "email", "phone", "status"],
      include: [{
        model: db.UserProfile,
        as: "profile",
        attributes: ["full_name", "avatar_url"],
      }],
    }],
    order: [["created_at", "DESC"]],
  });
};

const getPendingShops = async () => {
  return await getAllShops("PENDING");
};

const approveShop = async (adminId, shopId) => {
  const shop = await db.Shop.findByPk(shopId);
  if (!shop) throw new Error("Không tìm thấy gian hàng");
  if (shop.status === "APPROVED") throw new Error("Gian hàng đã được duyệt trước đó");

  await shop.update({ status: "APPROVED" });

  // Gửi thông báo cho Vendor
  if (shop.vendor_id) {
    try {
      await notificationService.createNotification(
        shop.vendor_id,
        "Gian hàng đã được duyệt",
        `Gian hàng "${shop.shop_name}" của bạn đã được quản trị viên phê duyệt hoạt động.`,
        "SHOP_STATUS"
      );
    } catch (notifErr) {
      console.error("Failed to create shop approval notification:", notifErr);
    }
  }

  // Gửi thông báo cho Admin (chính chủ)
  if (adminId) {
    try {
      await notificationService.createNotification(
        adminId,
        "Duyệt gian hàng thành công",
        `Bạn đã phê duyệt hoạt động thành công cho gian hàng "${shop.shop_name}".`,
        "SHOP_STATUS"
      );
    } catch (notifErr) {
      console.error("Failed to create admin shop approval notification:", notifErr);
    }
  }

  return shop;
};

const rejectShop = async (adminId, shopId, reason) => {
  const shop = await db.Shop.findByPk(shopId);
  if (!shop) throw new Error("Không tìm thấy gian hàng");
  if (shop.status === "REJECTED") throw new Error("Gian hàng đã bị từ chối trước đó");

  await shop.update({ status: "REJECTED" });

  // Gửi thông báo cho Vendor
  if (shop.vendor_id) {
    try {
      await notificationService.createNotification(
        shop.vendor_id,
        "Yêu cầu đăng ký gian hàng bị từ chối",
        `Đơn đăng ký gian hàng "${shop.shop_name}" của bạn đã bị từ chối. Lý do: ${reason || "Không có lý do cụ thể"}.`,
        "SHOP_STATUS"
      );
    } catch (notifErr) {
      console.error("Failed to create shop rejection notification:", notifErr);
    }
  }

  // Gửi thông báo cho Admin (chính chủ)
  if (adminId) {
    try {
      await notificationService.createNotification(
        adminId,
        "Từ chối gian hàng thành công",
        `Bạn đã từ chối đơn đăng ký gian hàng "${shop.shop_name}". Lý do: ${reason || "Không có lý do cụ thể"}.`,
        "SHOP_STATUS"
      );
    } catch (notifErr) {
      console.error("Failed to create admin shop rejection notification:", notifErr);
    }
  }

  // Trả về reason để frontend hiển thị (reason lưu ở frontend notification)
  return { ...shop.toJSON(), reject_reason: reason };
};


// ============================================================
// 3. CẤU HÌNH THÔNG SỐ HỆ THỐNG
// ============================================================

const getSystemSettings = async () => {
  return await db.SystemSetting.findAll({
    order: [["setting_key", "ASC"]],
  });
};

const updateSystemSetting = async (adminId, key, value) => {
  let setting = await db.SystemSetting.findByPk(key);
  if (!setting) {
    setting = await db.SystemSetting.create({
      setting_key: key,
      setting_value: value,
      updated_by: adminId,
    });
  } else {
    await setting.update({
      setting_value: value,
      updated_by: adminId,
    });
  }
  return setting;
};

// Quản lý danh mục
const getCategoriesAdmin = async () => {
  return await db.Category.findAll({
    attributes: ["id", "name", "slug", "parent_id", "image_url", "description", "is_active"],
    order: [["name", "ASC"]],
  });
};

const createCategory = async (data) => {
  const { name, description, parent_id, image_url } = data;

  // Tạo slug từ tên
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return await db.Category.create({
    name,
    slug,
    description: description || null,
    parent_id: parent_id || null,
    image_url: image_url || null,
    is_active: 1,
  });
};

const updateCategory = async (id, data) => {
  const category = await db.Category.findByPk(id);
  if (!category) throw new Error("Không tìm thấy danh mục");

  const updateData = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id;
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  await category.update(updateData);
  return category;
};

const deleteCategory = async (id) => {
  const category = await db.Category.findByPk(id);
  if (!category) throw new Error("Không tìm thấy danh mục");

  // Kiểm tra danh mục con
  const children = await db.Category.count({ where: { parent_id: id } });
  if (children > 0) throw new Error("Không thể xóa danh mục có chứa danh mục con");

  // Kiểm tra sản phẩm sử dụng
  const products = await db.Product.count({ where: { category_id: id } });
  if (products > 0) throw new Error("Không thể xóa danh mục đang có sản phẩm");

  await category.destroy();
  return { message: "Xóa danh mục thành công" };
};


// ============================================================
// 4. BÁO CÁO TÀI CHÍNH TỔNG & DÒNG TIỀN
// ============================================================

const getFinancialReport = async (dateFrom, dateTo) => {
  // Lấy cấu hình tỷ lệ từ system_settings
  const settings = await db.SystemSetting.findAll();
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.setting_key] = s.setting_value; });

  const commissionRate = parseFloat(settingsMap.default_commission_rate || "10.00");
  const gatewayFee = parseFloat(settingsMap.payment_gateway_fee || "5.00");
  const taxRate = parseFloat(settingsMap.tax_rate || "1.50");

  // Query tất cả đơn DELIVERED trong khoảng thời gian
  const dateFilter = {};
  if (dateFrom) dateFilter[Op.gte] = new Date(dateFrom);
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    dateFilter[Op.lte] = endDate;
  }

  const shopOrderWhere = { status: { [Op.ne]: "CANCELLED" } };
  if (Object.keys(dateFilter).length > 0) {
    shopOrderWhere.updated_at = dateFilter;
  }

  // Lấy tất cả shop_orders DELIVERED kèm parent_order (để biết payment_method)
  const deliveredOrders = await db.ShopOrder.findAll({
    where: shopOrderWhere,
    include: [{
      model: db.ParentOrder,
      as: "parentOrder",
      attributes: ["id", "payment_method", "payment_status", "user_id", "created_at"],
    }, {
      model: db.Shop,
      as: "shop",
      attributes: ["id", "shop_name"],
    }],
  });

  // Phân tách theo phương thức thanh toán
  let totalRevenue = 0;
  let codRevenue = 0;
  let onlineRevenue = 0;
  let codOrderCount = 0;
  let onlineOrderCount = 0;

  // Doanh thu theo shop
  const shopRevenueMap = {};

  for (const order of deliveredOrders) {
    const amount = parseFloat(order.final_amount || 0);
    totalRevenue += amount;

    const isCOD = order.parentOrder.payment_method === "COD";
    if (isCOD) {
      codRevenue += amount;
      codOrderCount++;
    } else {
      onlineRevenue += amount;
      onlineOrderCount++;
    }

    // Thống kê theo shop
    const shopId = order.shop_id;
    if (!shopRevenueMap[shopId]) {
      shopRevenueMap[shopId] = {
        shop_id: shopId,
        shop_name: order.shop?.shop_name || "N/A",
        total_revenue: 0,
        order_count: 0,
      };
    }
    shopRevenueMap[shopId].total_revenue += amount;
    shopRevenueMap[shopId].order_count++;
  }

  // Tính khấu trừ COD: chiết khấu sàn 10% + thuế 1.5% = 11.5%
  const codCommission = codRevenue * (commissionRate / 100);
  const codTax = codRevenue * (taxRate / 100);
  const codTotalDeduction = codCommission + codTax;
  const codShopPayout = codRevenue - codTotalDeduction;

  // Tính khấu trừ Thẻ: chiết khấu sàn 10% + phí cổng 5% + thuế 1.5% = 16.5%
  const onlineCommission = onlineRevenue * (commissionRate / 100);
  const onlineGatewayFee = onlineRevenue * (gatewayFee / 100);
  const onlineTax = onlineRevenue * (taxRate / 100);
  const onlineTotalDeduction = onlineCommission + onlineGatewayFee + onlineTax;
  const onlineShopPayout = onlineRevenue - onlineTotalDeduction;

  // Tổng hợp
  const totalCommission = codCommission + onlineCommission;
  const totalGatewayFee = onlineGatewayFee; // Chỉ Thẻ có phí cổng
  const totalTax = codTax + onlineTax;
  const totalDeduction = codTotalDeduction + onlineTotalDeduction;
  const totalShopPayout = codShopPayout + onlineShopPayout;

  // Thống kê đơn theo trạng thái (toàn bộ, không lọc ngày)
  const ordersByStatus = await db.ShopOrder.findAll({
    attributes: [
      "status",
      [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
    ],
    group: ["status"],
    raw: true,
  });

  // Top shops theo doanh thu
  const topShops = Object.values(shopRevenueMap)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  // Doanh thu 7 ngày gần nhất
  const dailyRevenue = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    let dayTotal = 0;
    for (const order of deliveredOrders) {
      const orderDate = new Date(order.updated_at);
      if (orderDate >= dayStart && orderDate <= dayEnd) {
        dayTotal += parseFloat(order.final_amount || 0);
      }
    }
    dailyRevenue.push({
      date: dayStart.toISOString().slice(0, 10),
      revenue: dayTotal,
    });
  }

  return {
    // Tỷ lệ cấu hình
    rates: {
      commission_rate: commissionRate,
      gateway_fee: gatewayFee,
      tax_rate: taxRate,
    },

    // Tổng quan
    summary: {
      total_revenue: totalRevenue,
      total_orders: deliveredOrders.length,
      total_commission: totalCommission,
      total_gateway_fee: totalGatewayFee,
      total_tax: totalTax,
      total_deduction: totalDeduction,
      total_shop_payout: totalShopPayout,
      platform_profit: totalCommission, // Lợi nhuận sàn = chiết khấu (phí cổng trả cho bên TT, thuế nộp nhà nước)
    },

    // Phân tách COD
    cod: {
      revenue: codRevenue,
      order_count: codOrderCount,
      commission: codCommission,
      tax: codTax,
      total_deduction: codTotalDeduction,
      deduction_rate: commissionRate + taxRate, // 11.5%
      shop_payout: codShopPayout,
    },

    // Phân tách Thẻ trực tuyến
    online: {
      revenue: onlineRevenue,
      order_count: onlineOrderCount,
      commission: onlineCommission,
      gateway_fee: onlineGatewayFee,
      tax: onlineTax,
      total_deduction: onlineTotalDeduction,
      deduction_rate: commissionRate + gatewayFee + taxRate, // 16.5%
      shop_payout: onlineShopPayout,
    },

    // Thống kê
    orders_by_status: ordersByStatus,
    top_shops: topShops,
    daily_revenue: dailyRevenue,
  };
};

// ============================================================
// 5. ĐỐI SOÁT THANH TOÁN & DUYỆT LỆNH TRẢ TIỀN
// ============================================================

const getPaymentReconciliation = async () => {
  // Lấy tất cả shop kèm bank info, và pending payouts
  const shops = await db.Shop.findAll({
    where: { status: "APPROVED" },
    attributes: ["id", "shop_name", "shop_logo", "bank_name", "bank_account_no", "bank_account_name"],
    include: [
      {
        model: db.User,
        as: "vendor",
        attributes: ["id", "email"],
        include: [{
          model: db.UserProfile,
          as: "profile",
          attributes: ["full_name"],
        }],
      },
    ],
    order: [["shop_name", "ASC"]],
  });

  // Lấy cấu hình tỷ lệ
  const settings = await db.SystemSetting.findAll();
  const settingsMap = {};
  settings.forEach(s => { settingsMap[s.setting_key] = s.setting_value; });
  const commissionRate = parseFloat(settingsMap.default_commission_rate || "10.00");
  const gatewayFee = parseFloat(settingsMap.payment_gateway_fee || "5.00");
  const taxRate = parseFloat(settingsMap.tax_rate || "1.50");
  // Calculate total deduction roughly as 10% (matching vendorService)
  const totalDeductionRate = 0.1;

  // Lấy tất cả đơn hàng không bị hủy để tính tổng doanh thu
  const orderItems = await db.OrderItem.findAll({
    include: [{
      model: db.ShopOrder,
      as: "shopOrder",
      where: { status: { [Op.ne]: "CANCELLED" } },
      attributes: ["shop_id", "status"],
      required: true
    }],
    attributes: ["unit_price", "quantity"]
  });

  const shopRevenue = {};
  const shopPending = {};
  orderItems.forEach(item => {
    const shopId = item.shopOrder.shop_id;
    if (!shopRevenue[shopId]) shopRevenue[shopId] = 0;
    if (!shopPending[shopId]) shopPending[shopId] = 0;

    const amount = parseFloat(item.unit_price) * item.quantity;
    
    // Doanh thu khả dụng (giống vendorService: tất cả đơn không hủy)
    shopRevenue[shopId] += amount;

    // Doanh thu tạm giữ (chỉ để hiển thị cho vui, các đơn chưa DELIVERED)
    if (item.shopOrder.status !== "DELIVERED") {
      shopPending[shopId] += amount;
    }
  });

  // Lấy lịch sử rút tiền đã duyệt
  const payouts = await db.ShopPayout.findAll({
    where: { status: "COMPLETED" },
    attributes: ["shop_id", "amount"]
  });
  const payoutStats = {};
  payouts.forEach(p => {
    if (!payoutStats[p.shop_id]) payoutStats[p.shop_id] = 0;
    payoutStats[p.shop_id] += parseFloat(p.amount);
  });

  const result = [];
  for (const shop of shops) {
    const latestPayout = await db.ShopPayout.findOne({
      where: { shop_id: shop.id },
      order: [["created_at", "DESC"]],
    });

    let reconciliation_status = "WAITING";
    if (latestPayout) {
      if (latestPayout.status === "PENDING" || latestPayout.status === "PROCESSING") {
        reconciliation_status = "WITHDRAWAL_REQUESTED";
      } else if (latestPayout.status === "COMPLETED") {
        reconciliation_status = "COMPLETED";
      }
    }

    const totalRevenue = shopRevenue[shop.id] || 0;
    const netRevenue = totalRevenue * (1 - totalDeductionRate);
    const approvedWithdrawals = payoutStats[shop.id] || 0;
    const availableBalance = Math.max(0, netRevenue - approvedWithdrawals);
    
    const pendingRevenue = shopPending[shop.id] || 0;
    const pendingBalance = pendingRevenue * (1 - totalDeductionRate);

    result.push({
      shop_id: shop.id,
      shop_name: shop.shop_name,
      shop_logo: shop.shop_logo,
      vendor_name: shop.vendor?.profile?.full_name || "N/A",
      vendor_email: shop.vendor?.email || "",
      bank_name: shop.bank_name,
      bank_account_no: shop.bank_account_no,
      bank_account_name: shop.bank_account_name,
      pending_balance: pendingBalance,
      available_balance: availableBalance,
      total_earned: netRevenue,
      reconciliation_status,
      latest_payout: latestPayout ? {
        id: latestPayout.id,
        amount: parseFloat(latestPayout.amount),
        status: latestPayout.status,
        created_at: latestPayout.created_at,
      } : null,
      rates: { commissionRate, gatewayFee, taxRate },
    });
  }

  return result;
};

const approveShopPayout = async (adminId, payoutId) => {
  const payout = await db.ShopPayout.findByPk(payoutId);
  if (!payout) throw new Error("Không tìm thấy lệnh thanh toán");
  if (payout.status === "COMPLETED") throw new Error("Lệnh thanh toán đã được duyệt trước đó");

  await payout.update({
    status: "COMPLETED",
    processed_by: adminId,
  });

  // Gửi thông báo cho Vendor & Admin
  try {
    const shop = await db.Shop.findByPk(payout.shop_id);
    if (shop) {
      if (shop.vendor_id) {
        await notificationService.createNotification(
          shop.vendor_id,
          "Lệnh rút tiền đã được duyệt",
          `Lệnh rút tiền trị giá ${Number(payout.amount).toLocaleString()}₫ từ ví gian hàng "${shop.shop_name}" đã được duyệt thành công.`,
          "PAYOUT_STATUS"
        );
      }
      if (adminId) {
        await notificationService.createNotification(
          adminId,
          "Duyệt rút tiền thành công",
          `Bạn đã duyệt thành công lệnh rút tiền trị giá ${Number(payout.amount).toLocaleString()}₫ của gian hàng "${shop.shop_name}".`,
          "PAYOUT_STATUS"
        );
      }
    }
  } catch (notifErr) {
    console.error("Failed to create payout approval notification:", notifErr);
  }

  return payout;
};


// ============================================================
// 6. LỊCH SỬ THANH TOÁN (PAYMENT LOGS)
// ============================================================

const getPaymentLogs = async (page = 1, limit = 20, filters = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.gateway_name) where.gateway_name = filters.gateway_name;
  if (filters.status) where.status = filters.status;
  
  if (filters.from_date || filters.to_date) {
    where.transaction_time = {};
    if (filters.from_date) {
      where.transaction_time[Op.gte] = new Date(`${filters.from_date}T00:00:00.000Z`);
    }
    if (filters.to_date) {
      where.transaction_time[Op.lte] = new Date(`${filters.to_date}T23:59:59.999Z`);
    }
  }
  
  if (filters.search) {
    where[Op.or] = [
      { order_code: { [Op.like]: `%${filters.search}%` } },
      { trans_id: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const { rows, count } = await db.PaymentLog.findAndCountAll({
    where,
    order: [["transaction_time", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  return {
    logs: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  };
};

const getOrderByCode = async (checkoutCode) => {
  const parentOrder = await db.ParentOrder.findOne({
    where: { checkout_code: checkoutCode },
    include: [
      {
        model: db.User,
        as: "user",
        attributes: ["id", "email", "phone"],
        include: [{ model: db.UserProfile, as: "profile", attributes: ["full_name"] }]
      },
      {
        model: db.ShopOrder,
        as: "shopOrders",
        include: [
          {
            model: db.Shop,
            as: "shop",
            attributes: ["id", "shop_name", "shop_logo"]
          },
          {
            model: db.OrderItem,
            as: "items",
          }
        ]
      }
    ]
  });

  if (!parentOrder) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return parentOrder;
};

export default {
  // Manager
  // Users
  createUser,
  getUsersByRole,
  updateUserProfileByAdmin,
  lockUser,
  unlockUser,
  // Shops
  getAllShops,
  getPendingShops,
  approveShop,
  rejectShop,
  // Settings
  getSystemSettings,
  updateSystemSetting,
  // Categories
  getCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  // Financial
  getFinancialReport,
  // Reconciliation
  getPaymentReconciliation,
  approveShopPayout,
  // Payment Logs
  getPaymentLogs,
  // Orders
  getOrderByCode,
};
