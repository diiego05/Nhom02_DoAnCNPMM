import db from "../src/models/index.js";

const update = async () => {
  try {
    const roles = await db.Role.findAll();
    for (const r of roles) {
      await r.update({ role_name: r.role_name.toLowerCase() });
    }
    console.log("Updated roles to lowercase successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

update();
