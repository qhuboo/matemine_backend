const config = require("../config");
const cart = require("../models/cartModels");
const stripe = require("stripe")(config.stripeSecretKey);
const stripeModels = require("../models/stripeModels");

async function getPaymentIntent(req, res, next) {
  // console.log("getPaymentIntent");
  const userId = req.user.userId;
  const cartId = await cart.getCartId(userId);

  const paymentIntentId = await stripeModels.getPaymentIntentId(cartId);
  if (paymentIntentId) {
    const result = await stripeModels.updatePaymentIntent(
      userId,
      paymentIntentId
    );

    if (result) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      if (paymentIntent) {
        return res.json({
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        });
      } else {
        return res.json({
          message: "There was an error getting a payment intent",
        });
      }
    } else {
      return res.json({
        message: "There was an error getting a payment intent",
      });
    }
  } else {
    // No payment intent exists in the databse so we have to get cart total and if its more than 50 cents
    const paymentIntent = await stripeModels.createPaymentIntent(userId);
    if (paymentIntent) {
      return res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      return res.json({
        message: "There was an error getting a payment intent",
      });
    }
  }
}

module.exports = { getPaymentIntent };
