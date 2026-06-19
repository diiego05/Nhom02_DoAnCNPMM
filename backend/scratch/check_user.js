import db from "../src/models/index.js";

const check = async () => {
  try {
    const user = await db.User.findOne({
      where: { email: "vendor@test.com" },
      include: [
        { model: db.Role, as: "role" },
        { model: db.Shop, as: "shop" }
      ]
    });
    if (!user) {
      console.log("User vendor@test.com not found!");
    } else {
      console.log("User details:");
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Status: ${user.status}`);
      console.log(`Role ID: ${user.role_id}`);
      console.log(`Role Name: ${user.role ? user.role.role_name : "NO ROLE"}`);
      console.log(`Shop: ${user.shop ? user.shop.name : "NO SHOP"}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
