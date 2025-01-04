const express = require("express");
const router = express.Router();
const config = require("../config");
const stripeControllers = require("../controllers/stripeControllers");
const stripe = require("stripe")(config.stripeSecretKey);
const { asyncWrapper } = require("../utils");

router.get(
  "/get-payment-intent",
  asyncWrapper(stripeControllers.getPaymentIntent)
);

module.exports = router;
