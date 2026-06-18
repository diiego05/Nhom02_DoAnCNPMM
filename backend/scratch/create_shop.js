import db from "../src/models/index.js";

const createShop = async () => {
  try {
    const user = await db.User.findOne({ where: { email: "vendor@test.com" } });
    if (!user) {
      console.log("User vendor@test.com not found!");
      process.exit(1);
    }

    const [shop, created] = await db.Shop.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        name: "UTEShop Official Store",
        phone: user.phone || "0987654321",
        address: "123 Sư Vạn Hạnh, Quận 10, TP.HCM",
        industry: "Thời trang Nam",
        description: "Cửa hàng thời trang thử nghiệm hệ thống UTEShop",
        status: "ACTIVE",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
        cover_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200"
      }
    });

    if (created) {
      console.log("Shop profile created successfully for vendor@test.com.");
    } else {
      console.log("Shop profile already existed for vendor@test.com.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createShop();
