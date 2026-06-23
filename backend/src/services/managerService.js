import db from "../models/index.js";

const getStats = async () => {
  const pendingProducts = await db.Product.count({ where: { approval_status: "PENDING" } });
  const pendingDisputes = await db.ReturnRequest.count({ where: { status: "PENDING" } });
  const platformVouchers = await db.Coupon.count({ where: { shop_id: null } });
  const bannedShops = await db.Shop.count({ where: { status: "BANNED" } });

  return {
    pendingProducts,
    pendingDisputes,
    platformVouchers,
    bannedShops,
  };
};

const getPendingProducts = async () => {
  return await db.Product.findAll({
    where: { approval_status: "PENDING" },
    include: [
      {
        model: db.Shop,
        as: "shop",
        attributes: ["id", "shop_name", "shop_logo"],
      },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["image_url"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const getActiveProducts = async () => {
  const { Op } = db.Sequelize;
  return await db.Product.findAll({
    where: { 
      approval_status: { [Op.in]: ["APPROVED", "HIDDEN", "REJECTED"] } 
    },
    include: [
      {
        model: db.Shop,
        as: "shop",
        attributes: ["id", "shop_name", "shop_logo"],
      },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["image_url"],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const updateProductStatus = async (productId, status) => {
  const product = await db.Product.findByPk(productId);
  if (!product) throw new Error("Sản phẩm không tồn tại");
  
  if (!["APPROVED", "REJECTED", "PENDING", "HIDDEN"].includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  await product.update({ approval_status: status });
  return product;
};

const getDisputes = async () => {
  return await db.ReturnRequest.findAll({
    include: [
      {
        model: db.User,
        as: "user",
        attributes: ["id", "email", "phone"],
        include: [
          {
            model: db.UserProfile,
            as: "profile",
            attributes: ["full_name"],
          },
        ],
      },
      {
        model: db.ShopOrder,
        as: "shopOrder",
        attributes: ["id", "shop_order_code", "final_amount"],
        include: [
          {
            model: db.Shop,
            as: "shop",
            attributes: ["id", "shop_name"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const resolveDispute = async (disputeId, status, resolvedBy) => {
  const dispute = await db.ReturnRequest.findByPk(disputeId);
  if (!dispute) throw new Error("Yêu cầu khiếu nại không tồn tại");

  if (!["RESOLVED_BY_ADMIN", "REJECTED"].includes(status)) {
    throw new Error("Trạng thái giải quyết khiếu nại không hợp lệ");
  }

  await dispute.update({
    status,
    resolved_by: resolvedBy,
    resolve_note: status === "RESOLVED_BY_ADMIN" ? "Đã duyệt hoàn tiền bởi Quản trị viên hệ thống" : "Từ chối khiếu nại bởi Quản trị viên hệ thống",
  });
  return dispute;
};

const getVouchers = async () => {
  return await db.Coupon.findAll({
    where: { shop_id: null },
    order: [["id", "DESC"]],
  });
};

const createVoucher = async (voucherData) => {
  const { 
    code, 
    discount_type, 
    discount_value, 
    max_discount, 
    min_order_amount, 
    usage_limit, 
    start_date, 
    end_date 
  } = voucherData;

  if (!code || !discount_type || discount_value === undefined) {
    throw new Error("Thiếu thông tin tạo mã giảm giá");
  }

  // Validate discount type
  if (discount_type !== "PERCENT" && discount_type !== "FIXED") {
    throw new Error("Loại giảm giá không hợp lệ");
  }

  const dVal = Number(discount_value);
  if (isNaN(dVal) || dVal <= 0) {
    throw new Error("Mức giảm phải lớn hơn 0");
  }

  if (discount_type === "PERCENT" && dVal > 100) {
    throw new Error("Mức giảm phần trăm không thể vượt quá 100%");
  }

  const minOrder = Number(min_order_amount || 0);
  if (isNaN(minOrder) || minOrder < 0) {
    throw new Error("Đơn tối thiểu không hợp lệ");
  }

  if (discount_type === "FIXED" && dVal > minOrder) {
    throw new Error("Mức giảm giá tiền mặt không được lớn hơn số tiền tối thiểu của đơn hàng");
  }

  let limit = null;
  if (usage_limit !== undefined && usage_limit !== null && usage_limit !== "") {
    limit = Number(usage_limit);
    if (isNaN(limit) || limit <= 0) {
      throw new Error("Giới hạn lượt dùng phải lớn hơn 0");
    }
  }

  let maxDisc = null;
  if (discount_type === "PERCENT" && max_discount !== undefined && max_discount !== null && max_discount !== "") {
    maxDisc = Number(max_discount);
    if (isNaN(maxDisc) || maxDisc < 0) {
      throw new Error("Mức giảm tối đa không hợp lệ");
    }
  }

  if (!start_date || !end_date) {
    throw new Error("Vui lòng nhập ngày bắt đầu và kết thúc");
  }

  const sDate = new Date(start_date);
  const eDate = new Date(end_date);

  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
    throw new Error("Định dạng ngày bắt đầu hoặc ngày kết thúc không hợp lệ");
  }

  if (sDate >= eDate) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
  }

  // Kiểm tra mã voucher trùng
  const existing = await db.Coupon.findOne({ where: { code: code.toUpperCase().trim() } });
  if (existing) throw new Error("Mã giảm giá này đã tồn tại trên hệ thống");

  return await db.Coupon.create({
    shop_id: null, // Platform-wide
    code: code.toUpperCase().trim(),
    discount_type,
    discount_value: dVal,
    max_discount: maxDisc,
    min_order_amount: minOrder,
    usage_limit: limit,
    start_date: sDate,
    end_date: eDate,
  });
};

const deleteVoucher = async (id) => {
  if (!id) throw new Error("Thiếu ID mã giảm giá");
  const voucher = await db.Coupon.findOne({ where: { id, shop_id: null } });
  if (!voucher) throw new Error("Không tìm thấy mã giảm giá sàn");
  
  await voucher.destroy();
  return true;
};

const getCampaigns = async () => {
  return await db.Campaign.findAll({
    order: [["id", "DESC"]],
  });
};

const createCampaign = async (campaignData) => {
  const { title, type, date } = campaignData;
  if (!title) throw new Error("Thiếu tên chiến dịch");

  return await db.Campaign.create({
    name: title,
    description: `Loại chiến dịch: ${type || 'Flash sale'}`,
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 ngày
    status: "SẮP DIỄN RA",
  });
};

const getVendors = async () => {
  return await db.Shop.findAll({
    include: [
      {
        model: db.User,
        as: "vendor",
        attributes: ["id", "email", "phone"],
        include: [
          {
            model: db.UserProfile,
            as: "profile",
            attributes: ["full_name"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

const updateVendorStatus = async (shopId, status, reason) => {
  const shop = await db.Shop.findByPk(shopId);
  if (!shop) throw new Error("Gian hàng không tồn tại");

  if (!["APPROVED", "BANNED", "PENDING", "REJECTED"].includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  await shop.update({ status });

  if (status === "BANNED") {
    console.log(`[AUDIT LOG] Shop "${shop.shop_name}" (ID: ${shop.id}) was BANNED. Reason: ${reason || "No reason provided"}`);
  } else {
    console.log(`[AUDIT LOG] Shop "${shop.shop_name}" (ID: ${shop.id}) was UNBANNED. Reason: ${reason || "No reason provided"}`);
  }

  return shop;
};

export default {
  getStats,
  getPendingProducts,
  getActiveProducts,
  updateProductStatus,
  getDisputes,
  resolveDispute,
  getVouchers,
  createVoucher,
  deleteVoucher,
  getCampaigns,
  createCampaign,
  getVendors,
  updateVendorStatus,
};
