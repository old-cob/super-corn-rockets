const pino = require('pino');
const config = require('config');

const logger = pino();

module.exports = name => {
  return logger.child({ name, level: config.get('log.level') });
};
