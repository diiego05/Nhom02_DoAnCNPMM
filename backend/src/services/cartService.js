import db from "../models/index.js";

// Lấy hoặc tạo giỏ hàng cho user
const getOrCreateCart = async (userId) => {
  const [cart] = await db.Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });
  return cart;
};

// Lấy giỏ hàng đầy đủ (kèm sản phẩm, variant, ảnh)
const getCartByUserId = async (userId) => {
  const cart = await db.Cart.findOne({
    where: { user_id: userId },
    include: [
      {
        model: db.CartItem,
        as: "items",
        include: [
          {
            model: db.Product,
            as: "product",
            attributes: ["id", "name", "slug", "price", "sale_price", "status"],
            include: [
              {
                model: db.ProductImage,
                as: "images",
                where: { is_primary: true },
                required: false,
                attributes: ["image_url"],
              },
            ],
          },
          {
            model: db.ProductVariant,
            as: "variant",
            attributes: ["id", "color", "size", "stock_quantity", "price"],
          },
        ],
      },
    ],
  });

  if (!cart) {
    return { items: [], totalItems: 0, totalAmount: 0 };
  }

  // Tính tổng
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unit_price),
    0,
  );

  return { ...cart.toJSON(), totalItems, totalAmount };
};

// Thêm sản phẩm vào giỏ hàng
const addItemToCart = async (userId, { productId, variantId, quantity }) => {
  // 1. Kiểm tra sản phẩm tồn tại
  const product = await db.Product.findByPk(productId);
  if (!product || product.status !== "ACTIVE") {
    throw new Error("Sản phẩm không tồn tại hoặc đã ngừng bán");
  }

  // 2. Kiểm tra tồn kho
  let stockQuantity = product.stock_quantity;
  let unitPrice = Number(product.sale_price || product.price);

  if (variantId) {
    const variant = await db.ProductVariant.findByPk(variantId);
    if (!variant || variant.product_id !== productId) {
      throw new Error("Biến thể sản phẩm không hợp lệ");
    }
    stockQuantity = variant.stock_quantity;
    if (variant.price) unitPrice = Number(variant.price);
  }

  if (stockQuantity < quantity) {
    throw new Error(`Chỉ còn ${stockQuantity} sản phẩm trong kho`);
  }

  // 3. Tìm hoặc tạo giỏ hàng
  const cart = await getOrCreateCart(userId);

  // 4. Kiểm tra item đã có trong giỏ chưa
  const existingItem = await db.CartItem.findOne({
    where: {
      cart_id: cart.id,
      product_id: productId,
      product_variant_id: variantId || null,
    },
  });

  if (existingItem) {
    // Cập nhật số lượng
    const newQty = existingItem.quantity + quantity;
    if (newQty > stockQuantity) {
      throw new Error(
        `Không thể thêm. Tổng số lượng vượt quá tồn kho (${stockQuantity})`,
      );
    }
    await existingItem.update({ quantity: newQty });
    return existingItem;
  }

  // 5. Tạo item mới
  return await db.CartItem.create({
    cart_id: cart.id,
    product_id: productId,
    product_variant_id: variantId || null,
    quantity,
    unit_price: unitPrice,
  });
};

// Cập nhật số lượng item
const updateCartItem = async (userId, itemId, quantity) => {
  const cart = await db.Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  const item = await db.CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });
  if (!item) throw new Error("Sản phẩm không có trong giỏ hàng");

  if (quantity <= 0) {
    await item.destroy();
    return { removed: true };
  }

  await item.update({ quantity });
  return item;
};

// Xóa item khỏi giỏ
const removeCartItem = async (userId, itemId) => {
  const cart = await db.Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");

  const item = await db.CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });
  if (!item) throw new Error("Sản phẩm không có trong giỏ hàng");

  await item.destroy();
  return true;
};

// Xóa toàn bộ giỏ hàng (sau khi đặt hàng)
const clearCart = async (userId) => {
  const cart = await db.Cart.findOne({ where: { user_id: userId } });
  if (!cart) return;
  await db.CartItem.destroy({ where: { cart_id: cart.id } });
};

export default {
  getOrCreateCart,
  getCartByUserId,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
