// Logger utility
const logger = {
  log: (message) => {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  info: (message) => {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
  },
};

module.exports = logger;
