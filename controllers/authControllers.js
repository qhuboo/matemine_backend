const bcrypt = require("bcrypt");
const {
  getUser,
  createUser,
  insertRefreshToken,
  getRefreshTokens,
  deleteRefreshToken,
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
    const { accessToken, refreshToken } = generateTokens(createdUser);
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
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = decoded.exp - nowInSeconds;
      const maxAge = remainingSeconds * 1000;
      return res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge,
          path: "/refresh",
          sameSite: "strict",
          signed: true,
        })
        .json({
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
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const remainingSeconds = decoded.exp - nowInSeconds;
        const maxAge = remainingSeconds * 1000;

        return res
          .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge,
            path: "/refresh",
            sameSite: "strict",
            signed: true,
          })
          .json({
            isAuthenticated: true,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            admin: user.admin,
            accessToken,
          });
      }
    } else {
      throw new AuthenticationError("Authentication failed");
    }
  } else {
    throw new AuthenticationError("Authentication failed");
  }
}

async function logoutUser(req, res, next) {
  try {
    // Check if the request body contains a refresh token
    if (!req.body.refreshToken) {
      return res
        .status(401)
        .json({ message: "Please provide a refresh token" });
    }
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);
    const storedRefreshTokens = await getRefreshTokens(decoded.userId);
    let validStoredToken = "";
    if (storedRefreshTokens) {
      for (const storedToken of storedRefreshTokens) {
        if (await bcrypt.compare(refreshToken, storedToken.token_hash))
          validStoredToken = storedToken.token_hash;
        break;
      }
      if (validStoredToken.length > 0) {
        const isRefreshTokenDeleted = await deleteRefreshToken(
          validStoredToken
        );
        if (isRefreshTokenDeleted) {
          return res.json({ message: "Successfully logged out" });
        }
      }
    } else {
      return res.status(200).json({ message: "Successfully logged out" });
    }
  } catch (err) {
    console.log(err);
    if (err.name === "TokenExpiredError") {
      if (err.message === "jwt expired") {
        return res.status(401).json({ message: "Refresh token is expired" });
      }
    }
  }
}

async function refreshTokens(req, res, next) {
  // Check if the request body contains a refresh token and email
  if (req.body.refreshToken && req.body.email) {
    // Get the refresh token
    const { refreshToken, email } = req.body;
    // Verify the refresh token

    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret);

    // Retrieve user from the database and check the token version against the database

    const user = await getUser(email);

    if (user.token_version !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Get all valid refresh tokens from the database for the user
    const refreshTokens = await getRefreshTokens(decoded.userId);

    let validStoredToken = "";
    if (refreshTokens) {
      for (const storedToken of refreshTokens) {
        if (await bcrypt.compare(refreshToken, storedToken.token_hash)) {
          validStoredToken = storedToken.token_hash;
          break;
        }
      }
      if (!(validStoredToken.length > 0)) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    } else {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    // Generate new token pair
    const newTokens = generateTokens(user);
    // Delete the old refresh token and insert the new one

    const isRefreshTokenDeleted = await deleteRefreshToken(validStoredToken);

    // Hash the new refresh token
    const newRefreshTokenSalt = await bcrypt.genSalt(12);
    const newRefreshTokenHash = await bcrypt.hash(
      newTokens.refreshToken,
      newRefreshTokenSalt
    );

    // Get the expiration date to insert into the database and then insert
    const expiresAt = new Date(decoded.exp * 1000);
    const isNewRefreshTokenInserted = await insertRefreshToken(
      user.user_id,
      newRefreshTokenHash,
      expiresAt
    );

    if (isRefreshTokenDeleted && isNewRefreshTokenInserted) {
      const decodedRefreshToken = jwt.decode(newTokens.refreshToken);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = decodedRefreshToken.exp - nowInSeconds;
      const maxAge = remainingSeconds * 1000;
      return res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge,
          path: "/refresh",
          sameSite: "strict",
          signed: true,
        })
        .json({ accessToken: newTokens.accessToken });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Please provide an email and refresh token" });
  }
}

module.exports = { registerUser, loginUser, logoutUser, refreshTokens };
