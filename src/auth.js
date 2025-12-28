const bcrypt = require('bcrypt');
const { z } = require('zod');
const { query } = require('./db');

const LOGIN_SCHEMA = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

const LOCK_THRESHOLD = 5;          // 5 başarısız deneme
const LOCK_MINUTES = 10;           // 10 dk kilit
const GENERIC_ERROR = { error: 'Invalid credentials' };

async function findUserByUsername(username) {
  const res = await query(
    'SELECT id, username, role, password_hash, failed_login_count, lock_until FROM users WHERE username=$1',
    [username]
  );
  return res.rows[0] || null;
}

async function lockUser(userId) {
  await query(
    `UPDATE users
     SET failed_login_count = failed_login_count + 1,
         lock_until = CASE
           WHEN failed_login_count + 1 >= $2 THEN NOW() + ($3 || ' minutes')::interval
           ELSE lock_until
         END
     WHERE id=$1`,
    [userId, LOCK_THRESHOLD, String(LOCK_MINUTES)]
  );
}

async function resetFailures(userId) {
  await query(
    'UPDATE users SET failed_login_count=0, lock_until=NULL, last_login_at=NOW() WHERE id=$1',
    [userId]
  );
}

function requireAuth(req, res, next) {
  if (!req.session?.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

async function login(req, res) {
  const parsed = LOGIN_SCHEMA.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Bad request' });

  const { username, password } = parsed.data;
  const user = await findUserByUsername(username);

  // username enumeration engellemek için generic dönüş
  if (!user || !user.password_hash) return res.status(401).json(GENERIC_ERROR);

  if (user.lock_until && new Date(user.lock_until) > new Date()) {
    return res.status(423).json({ error: 'Account temporarily locked' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await lockUser(user.id);
    return res.status(401).json(GENERIC_ERROR);
  }

  await resetFailures(user.id);

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ ok: true, user: req.session.user });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
}

function me(req, res) {
  res.json({ user: req.session.user });
}

module.exports = { login, logout, me, requireAuth };
