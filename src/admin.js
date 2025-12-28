const express = require('express');
const { z } = require('zod');
const { query } = require('./db');

const router = express.Router();

router.get('/users', async (_req, res) => {
  const r = await query('SELECT id, username, role, created_at FROM users ORDER BY id', []);
  res.json({ users: r.rows });
});

const PATCH_SCHEMA = z.object({
  role: z.enum(['admin', 'manager', 'ops', 'user']),
});

router.patch('/users/:id/role', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Bad request' });

  const parsed = PATCH_SCHEMA.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Bad request' });

  const r = await query(
    'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role',
    [parsed.data.role, id]
  );

  if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });

  res.json({ ok: true, user: r.rows[0] });
});

module.exports = { adminRouter: router };
