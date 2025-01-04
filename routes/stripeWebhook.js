const express = require("express");
const router = express.Router();
const config = require("../config");
const stripe = require("stripe")(config.stripeSecretKey);
const stripeModels = require("../models/stripeModels");
const cartModels = require("../models/cartModels");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("************** WEB HOOK ********************");
    let event = req.body;
    if (config.stripeTestWebhookSecret) {
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          config.stripeTestWebhookSecret
        );
      } catch (error) {
        console.log(
          `⚠️  Webhook signature verification failed.`,
          error.message
        );
      }
      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          // console.log("************ Payment intent succeeded **************");
          const paymentIntent = event.data.object;
          const clearCart = await cartModels.clearCartPaymentIntent(
            paymentIntent.id
          );
          const deletePaymentIntent = await stripeModels.deletePaymentIntentDB(
            paymentIntent.id
          );
          if (clearCart && deletePaymentIntent) {
            // console.log("The cart and payment intent have been reset");
            console.log(paymentIntent);
          }
          break;
        case "payment_intent.created":
          // console.log("************ Payment intent created **************");
          break;
      }
    }
    res.json({ received: true });
  }
);

module.exports = router;
