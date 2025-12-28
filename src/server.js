require('dotenv').config();
const express = require('express');
const pinoHttp = require('pino-http');
const { logger } = require('./logger');
const { router } = require('./routes');

const app = express();

// Correlation-ID: Proxy’den geleni al, yoksa basit üret
app.use((req, res, next) => {
  const incoming = req.header('X-Correlation-ID');
  req.correlationId = incoming || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
});

// JSON request logs
app.use(pinoHttp({
  logger,
  customProps: (req) => ({
    correlationId: req.correlationId,
  }),
}));

app.use(express.json());
app.use(router);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  logger.info({ port }, 'app-a started');
});
