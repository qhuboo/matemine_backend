class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
    this.name = "Database Error";
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "Validation Error";
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = "Authentication Error";
  }
}

module.exports = {
  AppError,
  DatabaseError,
  ValidationError,
  AuthenticationError,
};
