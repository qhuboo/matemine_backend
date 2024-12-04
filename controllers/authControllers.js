const bcrypt = require("bcrypt");
const {
  getUser,
  createUser,
  insertRefreshToken,
  getRefreshTokens,
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

      const refreshTokenSalt = await bcrypt.genSalt(12);
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

      if (result) {
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

async function refreshTokens(req, res, next) {
  // Check if the request body contains a refresh token and email
  if (req.body.refreshToken && req.body.email) {
    // Get the refresh token
    const { refreshToken } = req.body;
    const { email } = req.body;
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

    const user = await getUser(email);
    if (user.token_version !== decoded.tokenVersion) {
      res.status(401).json({ message: "Invalid refresh token" });
    }

    const refreshTokens = await getRefreshTokens(decoded.user_id);
    if (refreshTokens) {
      let validToken = false;
      for (const storedToken of refreshTokens) {
        if (await bcrypt.compare(refreshToken, refreshToken.token_hash)) {
          validToken = true;
          break;
        }
      }
      if (!validToken) {
        res.status(401).json({ message: "Invalid refresh token" });
      }
    }
    // Generate new token pair
    const newTokens = generateTokens(user);
    res.status(200).json(newTokens);
  }
}

module.exports = { registerUser, loginUser, refreshTokens };
