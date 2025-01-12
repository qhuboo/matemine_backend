const express = require("express");
const router = express.Router();
const config = require("../config");
const stripe = require("stripe")(config.stripeSecretKey);
const stripeModels = require("../models/stripeModels");
const cartModels = require("../models/cartModels");
const orderModels = require("../models/orderModels");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("************** WEB HOOK ********************");
    res.json({ received: true });
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
          console.log("************ Payment intent succeeded **************");
          const paymentIntent = event.data.object;
          // Use the latest charge object to get the receipt_url
          const latestCharge = await stripe.charges.retrieve(
            paymentIntent.latest_charge
          );
          if (latestCharge) {
            // If there is a latest charge create the order
            const createOrder = await orderModels.createOrder(
              paymentIntent.customer,
              paymentIntent.amount,
              paymentIntent.id,
              latestCharge.receipt_url
            );
            // If the order is successfully created, insert all the cart items into the order items table
            if (createOrder) {
              const insertOrderItems = orderModels.insertOrderItems(
                paymentIntent.customer,
                createOrder.order_id
              );
              if (insertOrderItems) {
                const clearCart = await cartModels.clearCartPaymentIntent(
                  paymentIntent.id
                );
                const deletePaymentIntent =
                  await stripeModels.deletePaymentIntentDB(paymentIntent.id);
                if (clearCart && deletePaymentIntent) {
                  return;
                }
              }
            }
          }
          break;
        case "payment_intent.created":
          // console.log("************ Payment intent created **************");
          break;
      }
    }
  }
);

module.exports = router;
