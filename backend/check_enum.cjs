const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSql() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const sql = process.argv[2];
  const [rows] = await c.query(sql);
  console.log(rows);
  process.exit(0);
}
runSql();
