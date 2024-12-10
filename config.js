const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const config = {
  port: process.env.PORT,
  databaseURL: process.env.DATABASE_URL,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
  cookieSecret: process.env.COOKIE_SECRET,
};

module.exports = config;
