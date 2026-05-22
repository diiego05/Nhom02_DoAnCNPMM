import db from "../models/index.js";
import { Op } from "sequelize";

const getProducts = async (filters) => {
  const {
    keyword, // Từ khóa tìm kiếm
    categorySlug, // Lọc theo danh mục
    brandId, // Lọc theo thương hiệu
    gender, // Lọc theo giới tính
    minPrice, // Giá từ
    maxPrice, // Giá đến
    isNew, // Hàng mới
    isFeatured, // Hàng nổi bật
    sortBy, // Sắp xếp: price_asc | price_desc | newest | best_sellers
    page = 1,
    limit = 12,
  } = filters;

  // 1. Xây dựng where clause động
  const where = { status: "ACTIVE" };

  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }
  if (brandId) {
    where.brand_id = brandId;
  }
  if (gender) where.gender = gender;
  if (isNew !== undefined) where.is_new = isNew === "true";
  if (isFeatured !== undefined) where.is_featured = isFeatured === "true";

  // Lọc giá theo effective price (sale_price nếu có, nếu không dùng price)
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
  }

  // 2. Xây dựng include (JOIN) động
  const include = [
    { model: db.Brand, as: "brand", attributes: ["id", "name", "slug"] },
    {
      model: db.ProductImage,
      as: "images",
      where: { is_primary: true },
      required: false,
    },
  ];

  // Lọc theo category slug (cần JOIN & hỗ trợ phân cấp cha-con-cháu)
  if (categorySlug) {
    const matchedCategory = await db.Category.findOne({
      where: { slug: categorySlug },
      include: [{ model: db.Category, as: "children" }]
    });

    if (matchedCategory) {
      let allCategoryIds = [matchedCategory.id];
      if (matchedCategory.children && matchedCategory.children.length > 0) {
        const childIds = matchedCategory.children.map(c => c.id);
        allCategoryIds.push(...childIds);
        
        // Tìm tiếp các danh mục cháu (chỉ dành cho cấp 3)
        const grandchildren = await db.Category.findAll({
          where: { parent_id: { [Op.in]: childIds } }
        });
        if (grandchildren.length > 0) {
          allCategoryIds.push(...grandchildren.map(g => g.id));
        }
      }

      where.category_id = { [Op.in]: allCategoryIds };
      
      include.push({
        model: db.Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      });
    } else {
      include.push({
        model: db.Category,
        as: "category",
        where: { slug: categorySlug },
      });
    }
  } else {
    include.push({
      model: db.Category,
      as: "category",
      attributes: ["id", "name", "slug"],
    });
  }

  // 3. Xác định ORDER BY
  const orderMap = {
    price_asc: [["price", "ASC"]],
    price_desc: [["price", "DESC"]],
    newest: [["created_at", "DESC"]],
    best_sellers: [["sold_count", "DESC"]],
    most_viewed: [["view_count", "DESC"]],
  };

  const order = orderMap[sortBy] || [["created_at", "DESC"]];

  //4. Phân trang
  const offset = (page - 1) * limit;

  //5. Query
  try {
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: rows,
    };
  } catch (error) {
    console.error("=== [productService.getProducts ERROR] ===");
    console.error("Filters used:", filters);
    console.error("Where clause:", where);
    console.error("Order clause:", order);
    console.error("Error details:", error);
    throw error;
  }
};

const getProductBySlug = async (slug) => {
  const product = await db.Product.findOne({
    where: { slug, status: "ACTIVE" },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.ProductImage, as: "images", order: [["sort_order", "ASC"]] },
      { model: db.ProductVariant, as: "variants" },
      { model: db.ProductAttribute, as: "attributes" },
    ],
  });
  if (!product) return null;

  // Tăng số lượt xem (view_count)
  await product.increment("view_count", { by: 1 });

  // Tính tổng tồn kho từ các variants
  const totalStock = product.variants.reduce(
    (sum, v) => sum + v.stock_quantity,
    0,
  );

  return { ...product.toJSON(), totalStock };
};

const getSimilarProducts = async (categoryId, excludeProductId, limit = 6) => {
  return await db.Product.findAll({
    where: {
      category_id: categoryId,
      id: { [Op.ne]: excludeProductId }, // Loại trừ sản phẩm hiện tại
      status: "ACTIVE",
    },
    include: [
      {
        model: db.ProductImage,
        as: "images",
        where: { is_primary: true },
        required: false,
      },
    ],
    limit,
    order: [["sold_count", "DESC"]],
  });
};

const getFeaturedProducts = async (limit = 10) => {
  // Validate limit
  const parsedLimit = Number(limit) || 10;

  return await db.Product.findAll({
    where: {
      status: "ACTIVE",
      is_featured: true,
    },

    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "sale_price",
      "stock_quantity",
      "sold_count",
      "is_new",
      "created_at",
    ],

    include: [
      {
        model: db.Brand,
        as: "brand",

        attributes: ["id", "name", "slug"],
      },

      {
        model: db.ProductImage,
        as: "images",

        attributes: ["id", "image_url", "is_primary"],

        where: {
          is_primary: true,
        },

        required: false,
      },
    ],

    order: [
      ["sold_count", "DESC"],
      ["created_at", "DESC"],
    ],

    limit: parsedLimit,

    subQuery: false,
  });
};

const getNewestProducts = async (limit = 10) => {
  const parsedLimit = Number(limit) || 10;

  return await db.Product.findAll({
    where: {
      status: "ACTIVE",
      is_new: true,
    },

    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "sale_price",
      "stock_quantity",
      "sold_count",
      "is_new",
      "created_at",
    ],

    include: [
      {
        model: db.Brand,
        as: "brand",

        attributes: ["id", "name", "slug"],
      },

      {
        model: db.ProductImage,
        as: "images",

        attributes: ["id", "image_url", "is_primary"],

        where: {
          is_primary: true,
        },

        required: false,
      },
    ],

    order: [
      ["created_at", "DESC"], // Mới nhất -> cũ nhất
    ],

    limit: parsedLimit,

    subQuery: false,
  });
};

const getBestSellerProducts = async (limit = 10) => {
  const parsedLimit = Number(limit) || 10;

  return await db.Product.findAll({
    where: {
      status: "ACTIVE",
    },

    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "sale_price",
      "stock_quantity",
      "sold_count",
      "is_new",
      "created_at",
    ],

    include: [
      {
        model: db.Brand,
        as: "brand",

        attributes: ["id", "name", "slug"],
      },

      {
        model: db.ProductImage,
        as: "images",

        attributes: ["id", "image_url", "is_primary"],

        where: {
          is_primary: true,
        },

        required: false,
      },
    ],

    order: [["sold_count", "DESC"]],

    limit: parsedLimit,

    subQuery: false,
  });
};

const getMostViewedProducts = async (limit = 10) => {
  const parsedLimit = Number(limit) || 10;

  return await db.Product.findAll({
    where: {
      status: "ACTIVE",
    },

    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "sale_price",
      "stock_quantity",
      "sold_count",
      "view_count",
      "is_new",
      "created_at",
    ],

    include: [
      {
        model: db.Brand,
        as: "brand",
        attributes: ["id", "name", "slug"],
      },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["id", "image_url", "is_primary"],
        where: {
          is_primary: true,
        },
        required: false,
      },
    ],

    order: [["view_count", "DESC"]],
    limit: parsedLimit,
    subQuery: false,
  });
};

export default {
  getProducts,
  getProductBySlug,
  getSimilarProducts,
  getFeaturedProducts,
  getNewestProducts,
  getBestSellerProducts,
  getMostViewedProducts,
};
