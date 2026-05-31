import couponService from "../services/couponService.js";

const getValidCoupons = async (req, res) => {
  try {
    const userId = req.user?.id;
    const coupons = await couponService.getValidCoupons(userId);
    return res.status(200).json({ message: "Success", data: coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getValidCoupons,
};
