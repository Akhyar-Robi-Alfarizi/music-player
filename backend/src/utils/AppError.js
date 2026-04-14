class AppError extends Error {
  constructor(statusCode, message, detail = null) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

module.exports = AppError;
