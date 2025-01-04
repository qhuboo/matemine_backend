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
  nodeEnv: process.env.NODE_ENV,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeTestClientSecret: process.env.STRIPE_TEST_CLIENT_SECRET,
  stripeTestPaymentIntentId: process.env.STRIPE_TEST_PAYMENT_INTENT_ID,
  stripeTestWebhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET,
};

module.exports = config;
