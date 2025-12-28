require("dotenv").config();
const bcrypt = require("bcrypt");
const { pool } = require("../src/db");

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || "ChangeMe123!";

const users = [
    { username: "admin", role: "admin" },
    { username: "manager", role: "manager" },
    { username: "ops", role: "ops" },
    { username: "user1", role: "user" },
    { username: "user2", role: "user" },
];

async function main() {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    for (const u of users) {
        await pool.query(
            `INSERT INTO users (username, role, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE
       SET role = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash`,
            [u.username, u.role, hash]
        );
    }

    const res = await pool.query(
        "SELECT username, role, (password_hash IS NOT NULL) AS has_password FROM users ORDER BY id"
    );
    console.log(res.rows);
    await pool.end();
}

main().catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
});
