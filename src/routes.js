const express = require('express');
const { healthcheck } = require('./db');

const router = express.Router();

router.get('/health', async (req, res) => {
  const dbOk = await healthcheck();
  res.status(200).json({
    ok: true,
    app: process.env.APP_NAME || 'app-a',
    db: dbOk ? 'up' : 'down',
    correlationId: req.correlationId || null,
    time: new Date().toISOString(),
  });
});

router.get('/', (req, res) => {
  res.status(200).send('app-a up');
});

module.exports = { router };
