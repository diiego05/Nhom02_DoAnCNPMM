import db from "../models/index.js";

// Lấy hoặc tạo giỏ hàng cho user
const getOrCreateCart = async (userId) => {
  const cart = await db.Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
  });
  return cart;
};


export default {
  getOrCreateCart,
};