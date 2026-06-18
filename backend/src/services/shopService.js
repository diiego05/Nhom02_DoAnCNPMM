import db from "../models/index.js";
import { Op } from "sequelize";

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

    // 3. Tạo hồ sơ shop
    const shop = await db.Shop.create(
      {
        user_id: userId,
        name: shopData.name,
        phone: shopData.phone,
        address: shopData.address,
        industry: shopData.industry,
        description: shopData.description || "",
        avatar_url: shopData.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
        cover_url: shopData.cover_url || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200",
        status: "ACTIVE",
      },
      { transaction }
    );

    await transaction.commit();
    return shop;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getShopProfile = async (shopId) => {
  return await db.Shop.findByPk(shopId);
};

const getShopByUserId = async (userId) => {
  return await db.Shop.findOne({ where: { user_id: userId } });
};

const updateShop = async (userId, shopData) => {
  const shop = await db.Shop.findOne({ where: { user_id: userId } });
  if (!shop) throw new Error("Shop not found");
  return await shop.update(shopData);
};

const getShopStatistics = async (shopId) => {
  // 1. Lấy tất cả OrderItems của Shop mà Order không bị hủy
  const orderItems = await db.OrderItem.findAll({
    include: [
      {
        model: db.Product,
        as: "product",
        where: { shop_id: shopId },
        required: true,
      },
      {
        model: db.Order,
        as: "order",
        where: { status: { [Op.ne]: "CANCELLED" } },
        required: true,
      },
    ],
  });

  // 2. Tính doanh thu và đếm đơn hàng độc nhất
  let totalRevenue = 0;
  const orderIds = new Set();
  orderItems.forEach((item) => {
    totalRevenue += parseFloat(item.total_price || 0);
    orderIds.add(item.order_id);
  });

  // 3. Đếm số lượng sản phẩm của Shop
  const productsCount = await db.Product.count({
    where: { shop_id: shopId, status: "ACTIVE" },
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
      const itemDate = new Date(item.created_at || item.order.created_at);
      return itemDate >= dayStart && itemDate <= dayEnd;
    });

    let daySum = 0;
    dayItems.forEach((item) => {
      daySum += parseFloat(item.total_price || 0);
    });
    dailyRevenue[i] = daySum;
  }

  // 5. Đếm bình luận mới (giả lập hoặc đếm từ ProductReview của shop)
  // Do product_reviews liên kết tới products, ta có thể lọc theo shop_id
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
  const approvedWithdrawals = await db.Withdrawal.sum("amount", {
    where: { shop_id: shopId, status: "APPROVED" }
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
  // Lấy các đơn hàng có sản phẩm thuộc về shop này
  return await db.Order.findAll({
    include: [
      {
        model: db.OrderItem,
        as: "items",
        include: [
          {
            model: db.Product,
            as: "product",
            where: { shop_id: shopId },
            required: true,
          },
        ],
        required: true,
      },
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
      brand_id,
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
        category_id,
        brand_id: brand_id || null,
        slug,
        description: description || "",
        price: price || 0,
        sale_price: sale_price || null,
        gender: gender || "UNISEX",
        material: material || "",
        shop_id: shopId,
        status: "ACTIVE",
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
      brand_id,
      description,
      price,
      sale_price,
      gender,
      material,
      variants,
      images,
      status,
    } = productData;

    // Cập nhật thông tin cơ bản
    await product.update(
      {
        name: name || product.name,
        category_id: category_id || product.category_id,
        brand_id: brand_id !== undefined ? brand_id : product.brand_id,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        sale_price: sale_price !== undefined ? sale_price : product.sale_price,
        gender: gender || product.gender,
        material: material !== undefined ? material : product.material,
        status: status || product.status,
      },
      { transaction }
    );

    // Cập nhật variants
    if (variants) {
      // Xóa tất cả các variants cũ
      await db.ProductVariant.destroy({
        where: { product_id: product.id },
        transaction,
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
  // Thay vì xóa cứng, ta đổi status sang INACTIVE
  return await product.update({ status: "INACTIVE" });
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
        model: db.ProductVariant,
        as: "variant",
        attributes: ["id", "size", "color"],
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

  return await db.Withdrawal.create({
    shop_id: shopId,
    amount,
    bank_name,
    account_number,
    account_name,
    status: "PENDING"
  });
};

const getWithdrawals = async (shopId) => {
  return await db.Withdrawal.findAll({
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
};
