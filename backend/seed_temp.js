import { Sequelize } from "sequelize";

const seq = new Sequelize('fashion_marketplace', 'root', '25032005', {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false
});

async function run() {
  try {
    await seq.query(`INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES ('payment_gateway_fee','5.00','Phí cổng thanh toán trực tuyến (%)'), ('tax_rate','1.50','Thuế giao dịch thành công (%)')`);
    
    // Thêm các danh mục gốc nếu chưa có
    await seq.query(`INSERT IGNORE INTO categories (name, slug, is_active) VALUES 
      ('Áo', 'ao', 1),
      ('Quần', 'quan', 1),
      ('Đầm', 'dam', 1),
      ('Váy', 'vay', 1),
      ('Phụ kiện', 'phu-kien', 1)
    `);
    
    console.log("Seeded database settings successfully.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await seq.close();
  }
}

run();
