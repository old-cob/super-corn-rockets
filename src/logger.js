const pino = require('pino');

const logger = pino();

module.exports = name => {
  return logger.child({ name });
};
