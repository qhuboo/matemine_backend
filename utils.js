const jwt = require("jsonwebtoken");
const config = require("./config");

function asyncWrapper(handlerFunction) {
  return async function (req, res, next) {
    try {
      await handlerFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      tokenVersion: user.token_version,
    },
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiry,
    }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.user_id,
      tokenVersion: user.token_version,
    },
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiry,
    }
  );

  return { accessToken, refreshToken };
}

module.exports = { asyncWrapper, generateTokens };
