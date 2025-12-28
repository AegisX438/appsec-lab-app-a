const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function query(text, params) {
  return pool.query(text, params);
}

async function healthcheck() {
  const res = await pool.query('SELECT 1 AS ok');
  return res.rows?.[0]?.ok === 1;
}

module.exports = { pool, query, healthcheck };
