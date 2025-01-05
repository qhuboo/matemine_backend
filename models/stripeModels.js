const config = require("../config");
const stripe = require("stripe")(config.stripeSecretKey);
const cart = require("./cartModels");
const db = require("../db/db-pool");

async function createPaymentIntent(userId) {
  try {
    // console.log("createPaymentIntent");
    const stripeId = await getStripeCustomerId(userId);
    const cartId = await cart.getCartId(userId);
    const cartTotal = Math.round((await cart.calculateCartTotal(cartId)) * 100);
    // console.log("stripeId: ", stripeId);
    // console.log("cartId: ", cartId);
    // console.log("cartTotal: ", cartTotal);

    if (cartTotal > 50 && stripeId) {
      //   console.log("We have a cartTotal of more than 50 cents and a stripeId");
      const paymentIntent = await stripe.paymentIntents.create({
        customer: stripeId,
        currency: "usd",
        amount: cartTotal,
      });
      if (paymentIntent) {
        // console.log("We created a payment intent");
        // console.log(paymentIntent);
        const result = await insertPaymentIntent(userId, paymentIntent.id);
        if (result) {
          //   console.log("Payment intent added to the database");
          return paymentIntent;
        }
        return undefined;
      }
    } else {
      //   console.log(
      //     "The cart total is not sufficient to create a payment intent"
      //   );
      return undefined;
    }
  } catch (error) {
    console.log(error);
  }
}

async function insertPaymentIntent(cartId, paymentIntentId) {
  try {
    const result = await db.query(
      `INSERT INTO payment_intents (id, cart_id) VALUES($1, $2) RETURNING *`,
      [paymentIntentId, cartId]
    );
    if (result.length === 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

async function getPaymentIntentId(cartId) {
  try {
    const result = await db.query(
      `SELECT id FROM payment_intents WHERE cart_id = $1`,
      [cartId]
    );
    if (result.length === 1) {
      return result[0].id;
    }
    return undefined;
  } catch (error) {
    console.log(error);
  }
}

async function updatePaymentIntent(userId, paymentIntentId) {
  try {
    // console.log("updatePaymentIntent");
    const cartId = await cart.getCartId(userId);
    const cartTotal = Math.round((await cart.calculateCartTotal(cartId)) * 100);
    const stripeId = await getStripeCustomerId(userId);

    // console.log(cartId);
    // console.log(cartTotal);
    // console.log(stripeId);

    // Get all payment intents with the status of requires_payment_method for the user
    let paymentIntents = [];
    let hasMore = true;
    let lastPaymentIntentId = null;

    while (hasMore) {
      // Build the parameters object dynamically
      const params = {
        customer: stripeId,
        limit: 100,
      };

      if (lastPaymentIntentId) {
        params.starting_after = lastPaymentIntentId;
      }

      const response = await stripe.paymentIntents.list(params);

      paymentIntents.push(
        ...response.data.filter(
          (paymentIntent) => paymentIntent.status === "requires_payment_method"
        )
      );

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        lastPaymentIntentId = response.data[response.data.length - 1].id;
      }
    }
    // console.log(paymentIntents);
    if (cartTotal < 50) {
      // Get all payment methods that require a payment method and cancel them
      // console.log(
      //   "The cart value is now below 50 cents and we'll start deleting all payment intents with a status of requires_payment_method"
      // );

      // Cancel all payment intents
      paymentIntents.forEach(async (paymentIntent) => {
        // console.log("Canceling: ", paymentIntent.id);
        const result = await stripe.paymentIntents.cancel(paymentIntent.id);
        if (result) {
          // console.log("Canceled: ", paymentIntent.id);
        }
      });

      // Delete all payment intents from the database
      const result = await deleteAllPaymentIntentsDB(cartId);
      if (result) {
        // console.log(result);
        return true;
      } else {
        return false;
      }
    } else {
      // If the cart total value is above 50 cents, update the payment intent object
      // console.log(
      //   "The cart total is more than 50 cents, update the payment intent"
      // );
      const paymentIntent = await stripe.paymentIntents.update(
        paymentIntentId,
        {
          amount: cartTotal,
        }
      );
      if (paymentIntent) {
        return true;
      } else {
        return false;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getStripeCustomerId(userId) {
  try {
    const result = await db.query(
      `SELECT stripe_customer_id FROM users WHERE user_id = $1`,
      [userId]
    );
    if (result.length === 1) {
      return result[0].stripe_customer_id;
    }
    return undefined;
  } catch (error) {
    console.log(error);
  }
}

async function deletePaymentIntentDB(paymentIntentId) {
  try {
    const result = await db.query(
      `DELETE FROM payment_intents WHERE id = $1 RETURNING *`,
      [paymentIntentId]
    );
    if (result.length === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteAllPaymentIntentsDB(cartId) {
  try {
    // console.log("deleteAllPaymentIntentsDB");
    const result = await db.query(
      `DELETE FROM payment_intents WHERE cart_id = $1`,
      [cartId]
    );
    if (result.length > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createPaymentIntent,
  insertPaymentIntent,
  getPaymentIntentId,
  getStripeCustomerId,
  updatePaymentIntent,
  deletePaymentIntentDB,
  deleteAllPaymentIntentsDB,
};
