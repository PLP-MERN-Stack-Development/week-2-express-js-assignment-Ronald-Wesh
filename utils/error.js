// Custom error classes for better error handling
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends CustomError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class AuthenticationError extends CustomError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

module.exports = {
  CustomError,
  NotFoundError,
  ValidationError,
  AuthenticationError
};