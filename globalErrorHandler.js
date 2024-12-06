const {
  ValidationError,
  AuthenticationError,
  DatabaseError,
} = require("./errorTypes");

function globalErrorHandler(err, req, res, next) {
  console.log(err);

  if (err.name === "TokenExpiredError") {
    if (err.message === "jwt expired") {
      return res.status(401).json({ message: "Refresh token is expired" });
    }
  }

  // Handle Validation Errors
  if (err instanceof ValidationError) {
    console.log(err.errors);

    return res
      .status(err.statusCode || 400)
      .json({ message: err.message, errors: err.errors });
  }
  // Handle Authentication Errors
  if (err instanceof AuthenticationError) {
    console.log(err);

    return res.status(err.statusCode || 401).json({ message: err.message });
  }
  //Handle Database Errors
  if (err instanceof DatabaseError) {
    console.log(err);

    return res
      .status(err.statusCode || 500)
      .json({ message: "Internal Server Error" });
  }
  return res.status(500).json({ message: "Internal Server Error" });
}

module.exports = { globalErrorHandler };
