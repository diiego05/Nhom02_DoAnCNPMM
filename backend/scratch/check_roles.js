import db from "../src/models/index.js";

const check = async () => {
  try {
    const roles = await db.Role.findAll();
    console.log("Current Roles in database:");
    roles.forEach(r => console.log(`ID: ${r.id}, Name: ${r.role_name}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
