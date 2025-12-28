require('dotenv').config();
const { pool } = require('../src/db');

const users = [
  { username: 'admin', role: 'admin' },
  { username: 'manager', role: 'manager' },
  { username: 'ops', role: 'ops' },
  { username: 'user1', role: 'user' },
  { username: 'user2', role: 'user' },
];

async function main() {
  for (const u of users) {
    await pool.query(
      `INSERT INTO users (username, role)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role`,
      [u.username, u.role]
    );
  }

  const res = await pool.query('SELECT username, role FROM users ORDER BY id');
  console.log(res.rows);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
