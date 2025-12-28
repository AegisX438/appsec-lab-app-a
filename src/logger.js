const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    app: process.env.APP_NAME || 'app-a',
    env: process.env.ENV || 'local',
  },
});

module.exports = { logger };
