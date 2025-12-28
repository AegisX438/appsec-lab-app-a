require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/run-sql.js <sql-file>');
    process.exit(2);
  }

  const sqlPath = path.resolve(file);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();
  await client.query(sql);
  await client.end();

  console.log(`OK: ran ${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
