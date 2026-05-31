import db from "../models/index.js";
const { Coupon, Sequelize } = db;
const Op = Sequelize.Op;

const getValidCoupons = async (userId) => {
  const currentDate = new Date();
  
  // Lấy các mã còn hiệu lực, còn hạn sử dụng, và số lượng used_count < usage_limit (nếu có giới hạn)
  const coupons = await Coupon.findAll({
    where: {
      is_active: true,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
      [Op.or]: [
        { usage_limit: null },
        { usage_limit: { [Op.gt]: db.sequelize.col('used_count') } }
      ]
    },
    order: [["discount_value", "DESC"]],
  });

  if (!userId) return coupons;

  // Lấy lịch sử sử dụng coupon của user
  const userUsages = await db.UserCouponUsage.findAll({
    where: { user_id: userId },
    attributes: ['coupon_id', [Sequelize.fn('COUNT', Sequelize.col('coupon_id')), 'usage_count']],
    group: ['coupon_id'],
    raw: true
  });

  const usageMap = {};
  userUsages.forEach(u => {
    usageMap[u.coupon_id] = parseInt(u.usage_count);
  });

  // Lọc ra các coupon mà user chưa vượt quá giới hạn
  const validCouponsForUser = coupons.filter(c => {
    const userUsedCount = usageMap[c.id] || 0;
    return userUsedCount < c.per_user_limit;
  });

  return validCouponsForUser;
};

export default {
  getValidCoupons,
};
