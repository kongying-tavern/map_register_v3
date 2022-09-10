module.exports = class Logger {
  static info = (...args) => console.log('[updateApiDts]', ...args)
  static error = (...args) => console.error('[updateApiDts]', ...args)
}
