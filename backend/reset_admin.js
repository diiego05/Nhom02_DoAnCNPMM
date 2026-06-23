import { Sequelize } from "sequelize";
import bcrypt from "bcryptjs";

const seq = new Sequelize('fashion_marketplace', 'root', '25032005', {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);
    
    await seq.query(`UPDATE users SET password = '${hashedPassword}' WHERE email = 'admin@uteshop.com'`);
    
    console.log("Reset admin password successfully.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await seq.close();
  }
}

run();
