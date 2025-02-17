export default class AppError extends Error {
  constructor(statusCode, message, error) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.error = error
  }
}
