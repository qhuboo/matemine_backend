const bcrypt = require("bcrypt");
const {
  getUser,
  createUser,
  insertRefreshToken,
} = require("../models/authModels");
const { validationResult } = require("express-validator");
const { ValidationError, AuthenticationError } = require("../errorTypes");
const { generateTokens } = require("../utils");
const jwt = require("jsonwebtoken");
const config = require("../config");

async function registerUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials`, allErrors);
  }

  const { email, password, firstName, lastName } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const newUser = { firstName, lastName, email, hash };
  const createdUser = await createUser(newUser);
  console.log(createdUser);

  if (createdUser) {
    // Generate the tokens
    const { accessToken, refreshToken } = generateTokens(createdUser.email);
    // Hash the refresh token and insert into the database
    const refreshTokenSalt = await bcrypt.genSalt(12);
    const refreshTokenHash = await bcrypt.hash(refreshToken, refreshTokenSalt);

    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

    const expiresAt = new Date(decoded.exp * 1000);

    const result = await insertRefreshToken(
      createdUser.user_id,
      refreshTokenHash,
      expiresAt
    );
    if (result) {
      res.json({
        isAuthenticated: true,
        email: createdUser.email,
        firstName: createdUser.first_name,
        lastName: createdUser.last_name,
        admin: createdUser.admin,
        accessToken,
        refreshToken,
      });
    }
  }
}

async function loginUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials`, allErrors);
  }

  const { email, password } = req.body;
  const user = await getUser(email);

  if (user) {
    const hashedPassword = user.password;
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
      const { accessToken, refreshToken } = generateTokens(user.email);

      const refreshTokenSalt = await bcrypt.salt(12);
      const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        refreshTokenSalt
      );

      const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

      const expiresAt = new Date(decoded.exp * 1000);

      const result = await insertRefreshToken(
        user.user_id,
        refreshTokenHash,
        expiresAt
      );

      if (result.length > 0) {
        res.json({
          isAuthenticated: true,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          admin: user.admin,
          accessToken,
          refreshToken,
        });
      }
    } else {
      throw new AuthenticationError("Authentication failed");
    }
  } else {
    throw new AuthenticationError("Authentication failed");
  }
}

module.exports = { registerUser, loginUser };
