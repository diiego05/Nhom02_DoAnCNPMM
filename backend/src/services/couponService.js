import db from "../models/index.js";
const { Coupon, Sequelize } = db;
const Op = Sequelize.Op;

const getValidCoupons = async (userId) => {
  const currentDate = new Date();
  
  // Lấy các mã còn hiệu lực, còn hạn sử dụng, và số lượng used_count < usage_limit (nếu có giới hạn)
  const coupons = await Coupon.findAll({
    where: {
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
  // TODO: Cần có bảng UserCouponUsage để track. Tạm thời trả về toàn bộ coupons hợp lệ
  return coupons;
};

export default {
  getValidCoupons,
};
