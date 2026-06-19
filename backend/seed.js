import db from "./src/models/index.js";

const seed = async () => {
  try {
    await db.Role.bulkCreate([
      { id: 1, role_name: "admin" },
      { id: 2, role_name: "user" },
      { id: 3, role_name: "vendor" },
      { id: 4, role_name: "manager" },
      { id: 5, role_name: "shipper" }
    ], { ignoreDuplicates: true });
    console.log("Roles seeded.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
