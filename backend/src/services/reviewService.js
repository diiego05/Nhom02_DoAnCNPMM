import db from "../models/index.js";

const { ProductReview, Product, User, Order } = db;

const createReview = async (userId, productId, { order_id, variant_id, rating, comment, images }) => {
  const transaction = await db.sequelize.transaction();
  try {
    // 1. Kiểm tra đơn hàng đã mua và ở trạng thái DELIVERED
    const order = await Order.findOne({
      where: { id: order_id, user_id: userId, status: "DELIVERED" },
    });
    if (!order) {
      throw new Error("Đơn hàng không hợp lệ hoặc chưa được giao thành công.");
    }

    // 2. Kiểm tra xem người dùng đã đánh giá sản phẩm này trong đơn hàng này chưa
    const existingReview = await ProductReview.findOne({
      where: { user_id: userId, product_id: productId, order_id: order_id },
    });
    if (existingReview) {
      throw new Error("Bạn đã đánh giá sản phẩm này trong đơn hàng này.");
    }

    // 3. Lưu Review
    const newReview = await ProductReview.create(
      {
        user_id: userId,
        product_id: productId,
        variant_id: variant_id || null,
        order_id: order_id,
        rating,
        comment,
        images: images ? JSON.stringify(images) : null,
      },
      { transaction }
    );

    // 4. Tính toán lại rating trung bình và tăng review_count
    const product = await Product.findByPk(productId, { transaction });
    const currentReviewCount = product.review_count;
    const currentRatingAvg = parseFloat(product.rating_average);

    const newReviewCount = currentReviewCount + 1;
    const newRatingAvg = ((currentRatingAvg * currentReviewCount) + parseFloat(rating)) / newReviewCount;

    await product.update(
      { review_count: newReviewCount, rating_average: newRatingAvg },
      { transaction }
    );

    // 5. Tặng phần thưởng (Ví dụ: 100 loyalty points)
    const user = await User.findByPk(userId, { transaction });
    if (user) {
      await user.increment("loyalty_points", { by: 100, transaction });
    }

    await transaction.commit();
    return newReview;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getProductReviews = async (productId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const reviews = await ProductReview.findAndCountAll({
    where: { product_id: productId, is_visible: true },
    include: [
      { model: User, as: "user", attributes: ["id", "email"], include: ["profile"] },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    total: reviews.count,
    page,
    totalPages: Math.ceil(reviews.count / limit),
    reviews: reviews.rows,
  };
};

export default {
  createReview,
  getProductReviews,
};
