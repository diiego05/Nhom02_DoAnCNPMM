import db from "../models/index.js";
import { Op } from "sequelize";
import notificationService from "./notificationService.js";

const registerShop = async (userId, shopData) => {
  const transaction = await db.sequelize.transaction();
  try {
    // 1. Tìm hoặc tạo role VENDOR
    const [vendorRole] = await db.Role.findOrCreate({
      where: { role_name: "vendor" },
      transaction,
    });

    // 2. Cập nhật role cho user
    await db.User.update(
      { role_id: vendorRole.id },
      { where: { id: userId }, transaction }
    );

    // 3. Kiểm tra shop đã bị xóa mềm trước đó (cùng vendor hoặc cùng tên)
    const existingShop = await db.Shop.findOne({
      where: {
        [Op.or]: [
          { vendor_id: userId },
          { shop_name: shopData.name },
        ],
      },
      paranoid: false,
      transaction,
    });

    let shop;
    if (existingShop && existingShop.deleted_at) {
      // Khôi phục shop đã bị xóa mềm
      await existingShop.restore({ transaction });
      shop = await existingShop.update({
        shop_name: shopData.name,
        shop_logo: shopData.avatar_url || existingShop.shop_logo,
        description: shopData.description || existingShop.description,
        status: "PENDING",
      }, { transaction });
    } else if (existingShop) {
      throw new Error("Bạn đã có gian hàng hoặc tên gian hàng đã tồn tại");
    } else {
      // Tạo hồ sơ shop mới
      shop = await db.Shop.create(
        {
          vendor_id: userId,
          shop_name: shopData.name,
          shop_logo: shopData.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
          description: shopData.description || "",
          status: "PENDING",
        },
        { transaction }
      );
    }

    await transaction.commit();
    return shop;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getShopProfile = async (shopId) => {
  const shop = await db.Shop.findByPk(shopId);
  if (!shop) return null;

  const productsCount = await db.Product.count({
    where: { shop_id: shopId, approval_status: "APPROVED" },
  });

  const reviewsCount = await db.ProductReview.count({
    include: [
      {
        model: db.Product,
        as: "product",
        where: { shop_id: shopId },
        required: true,
      },
    ],
  });

  return {
    ...shop.toJSON(),
    productsCount,
    reviewsCount,
  };
};

const getShopByUserId = async (userId) => {
  return await db.Shop.findOne({ where: { vendor_id: userId } });
};

const getTopShops = async (limit = 10) => {
  return await db.Shop.findAll({
    where: { status: "APPROVED" },
    order: [["rating", "DESC"]],
    limit: Number(limit) || 10,
    attributes: ["id", "shop_name", "shop_logo", "description", "rating", "status"],
  });
};

const updateShop = async (userId, shopData) => {
  const shop = await db.Shop.findOne({ where: { vendor_id: userId } });
  if (!shop) throw new Error("Shop not found");
  return await shop.update(shopData);
};

const getShopStatistics = async (shopId) => {
  // 1. Lấy tất cả OrderItems của Shop mà ShopOrder không bị hủy
  const orderItems = await db.OrderItem.findAll({
    include: [
      {
        model: db.ShopOrder,
        as: "shopOrder",
        where: { shop_id: shopId, status: { [Op.ne]: "CANCELLED" } },
        required: true,
      },
    ],
  });

  // 2. Tính doanh thu và đếm đơn hàng độc nhất
  let totalRevenue = 0;
  const orderIds = new Set();
  orderItems.forEach((item) => {
    totalRevenue += parseFloat(item.unit_price * item.quantity || 0);
    orderIds.add(item.shop_order_id);
  });

  // 3. Đếm số lượng sản phẩm của Shop
  const productsCount = await db.Product.count({
    where: { shop_id: shopId, approval_status: "APPROVED" },
  });

  // 4. Doanh thu 7 ngày qua
  const dailyRevenue = Array(7).fill(0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - (6 - i));
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(today);
    dayEnd.setDate(today.getDate() - (6 - i));
    dayEnd.setHours(23, 59, 59, 999);

    const dayItems = orderItems.filter((item) => {
      const itemDate = new Date(item.shopOrder.created_at);
      return itemDate >= dayStart && itemDate <= dayEnd;
    });

    let daySum = 0;
    dayItems.forEach((item) => {
      daySum += parseFloat(item.unit_price * item.quantity || 0);
    });
    dailyRevenue[i] = daySum;
  }

  // 5. Đếm bình luận mới
  const commentsCount = await db.sequelize.models.ProductReview
    ? await db.sequelize.models.ProductReview.count({
        include: [
          {
            model: db.Product,
            as: "product",
            where: { shop_id: shopId },
            required: true,
          },
        ],
      })
    : 12; // fallback mock

  // Tính toán doanh thu sau chiết khấu 10% và số dư khả dụng
  const approvedWithdrawals = await db.ShopPayout.sum("amount", {
    where: { shop_id: shopId, status: "COMPLETED" }
  }) || 0;
  const netRevenue = totalRevenue * 0.9;
  const availableBalance = Math.max(0, netRevenue - approvedWithdrawals);

  return {
    revenue: totalRevenue,
    netRevenue,
    availableBalance,
    ordersCount: orderIds.size,
    productsCount,
    commentsCount,
    dailyRevenue,
  };
};

const getShopOrders = async (shopId) => {
  return await db.ShopOrder.findAll({
    where: { shop_id: shopId },
    include: [
      {
        model: db.OrderItem,
        as: "items",
      },
      {
        model: db.ParentOrder,
        as: "parentOrder",
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "email"],
            include: [
              {
                model: db.UserProfile,
                as: "profile",
                attributes: ["full_name"],
              },
            ],
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
  });
};

const createShopProduct = async (shopId, productData) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      name,
      category_id,
      description,
      price,
      sale_price,
      gender,
      material,
      variants,
      images,
    } = productData;

    // Tạo slug duy nhất từ tên
    const slug =
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    // 1. Tạo Product
    const product = await db.Product.create(
      {
        name,
        category_id: category_id || null,
        slug,
        description: description || "",
        price: price || 0,
        sale_price: sale_price || null,
        gender: gender || "UNISEX",
        material: material || "",
        shop_id: shopId,
        approval_status: "APPROVED",
      },
      { transaction }
    );

    // 2. Tạo Product Variants nếu có
    if (variants && variants.length > 0) {
      await db.ProductVariant.bulkCreate(
        variants.map((v, i) => ({
          product_id: product.id,
          sku: v.sku || `SKU-${product.id}-${v.size}-${v.color}-${i}-${Date.now()}`,
          size: v.size || "Free Size",
          color: v.color || "Default",
          price: v.price || 0,
          sale_price: v.sale_price || null,
          color_hex: v.color_hex || "#888888",
          stock_quantity: v.stock_quantity || 0,
          is_active: true,
        })),
        { transaction }
      );
    } else {
      // Mặc định tạo 1 variant nếu không nhập
      await db.ProductVariant.create(
        {
          product_id: product.id,
          sku: `SKU-${product.id}-${Date.now()}`,
          size: "Free Size",
          color: "Default",
          color_hex: "#888888",
          price: 0,
          stock_quantity: productData.stock_quantity || 10,
          is_active: true,
        },
        { transaction }
      );
    }

    // 3. Tạo Product Images nếu có
    if (images && images.length > 0) {
      await db.ProductImage.bulkCreate(
        images.map((img, i) => ({
          product_id: product.id,
          image_url: img.image_url,
          alt_text: product.name,
          sort_order: i,
          is_primary: i === 0,
        })),
        { transaction }
      );
    } else {
      // Mặc định tạo 1 ảnh mẫu
      await db.ProductImage.create(
        {
          product_id: product.id,
          image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400",
          alt_text: product.name,
          sort_order: 0,
          is_primary: true,
        },
        { transaction }
      );
    }

    await transaction.commit();
    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateShopProduct = async (shopId, productId, productData) => {
  const transaction = await db.sequelize.transaction();
  try {
    const product = await db.Product.findOne({
      where: { id: productId, shop_id: shopId },
      transaction,
    });
    if (!product) throw new Error("Product not found or not owned by shop");

    const {
      name,
      category_id,
      description,
      price,
      sale_price,
      gender,
      material,
      variants,
      images,
      approval_status,
    } = productData;

    // Cập nhật thông tin cơ bản
    await product.update(
      {
        name: name || product.name,
        category_id: category_id || product.category_id,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        sale_price: sale_price !== undefined ? sale_price : product.sale_price,
        gender: gender || product.gender,
        material: material !== undefined ? material : product.material,
        approval_status: approval_status || product.approval_status,
      },
      { transaction }
    );

    // Cập nhật variants
    if (variants) {
      // Xóa tất cả các variants cũ (xóa cứng vì đang thay thế bằng variants mới)
      await db.ProductVariant.destroy({
        where: { product_id: product.id },
        transaction,
        force: true,
      });
      // Tạo variants mới
      await db.ProductVariant.bulkCreate(
        variants.map((v, i) => ({
          product_id: product.id,
          sku: v.sku || `SKU-${product.id}-${v.size}-${v.color}-${i}-${Date.now()}`,
          size: v.size || "Free Size",
          color: v.color || "Default",
          price: v.price || 0,
          sale_price: v.sale_price || null,
          color_hex: v.color_hex || "#888888",
          stock_quantity: v.stock_quantity || 0,
          is_active: true,
        })),
        { transaction }
      );
    }

    // Cập nhật images
    if (images) {
      await db.ProductImage.destroy({
        where: { product_id: product.id },
        transaction,
      });
      await db.ProductImage.bulkCreate(
        images.map((img, i) => ({
          product_id: product.id,
          image_url: img.image_url,
          alt_text: product.name,
          sort_order: i,
          is_primary: i === 0,
        })),
        { transaction }
      );
    }

    await transaction.commit();
    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteShopProduct = async (shopId, productId) => {
  const product = await db.Product.findOne({
    where: { id: productId, shop_id: shopId },
  });
  if (!product) throw new Error("Product not found or not owned by shop");
  // Soft delete sản phẩm và các variants liên quan
  await db.ProductVariant.destroy({ where: { product_id: product.id } });
  return await product.destroy();
};

const getShopReviews = async (shopId) => {
  return await db.ProductReview.findAll({
    include: [
      {
        model: db.Product,
        as: "product",
        where: { shop_id: shopId },
        attributes: ["id", "name"],
        required: true,
      },
      {
        model: db.User,
        as: "user",
        attributes: ["id", "email"],
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

const requestWithdrawal = async (shopId, withdrawData) => {
  const { amount, bank_name, account_number, account_name } = withdrawData;
  if (!amount || amount <= 0) throw new Error("Số tiền rút không hợp lệ");
  if (!bank_name || !account_number || !account_name) throw new Error("Thiếu thông tin ngân hàng");

  // Tính số dư khả dụng
  const stats = await getShopStatistics(shopId);
  if (amount > stats.availableBalance) {
    throw new Error("Số dư khả dụng không đủ để thực hiện giao dịch này");
  }

  // Create ShopPayout entry
  const payout = await db.ShopPayout.create({
    shop_id: shopId,
    amount,
    bank_name,
    bank_account_no: account_number,
    bank_account_name: account_name,
    status: "PENDING"
  });

  // Gửi thông báo cho Vendor (chính chủ)
  try {
    const shop = await db.Shop.findByPk(shopId);
    if (shop && shop.vendor_id) {
      await notificationService.createNotification(
        shop.vendor_id,
        "Yêu cầu rút tiền thành công",
        `Bạn đã gửi yêu cầu rút tiền trị giá ${Number(amount).toLocaleString()}₫ về tài khoản ngân hàng ${bank_name}. Vui lòng chờ quản trị viên phê duyệt.`,
        "PAYOUT_STATUS"
      );
    }
  } catch (notifErr) {
    console.error("Failed to create withdrawal request notification:", notifErr);
  }

  return payout;
};

const getWithdrawals = async (shopId) => {
  return await db.ShopPayout.findAll({
    where: { shop_id: shopId },
    order: [["created_at", "DESC"]]
  });
};

export default {
  registerShop,
  getShopProfile,
  getShopByUserId,
  updateShop,
  getShopStatistics,
  getShopOrders,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  getShopReviews,
  requestWithdrawal,
  getWithdrawals,
  getTopShops,
};
