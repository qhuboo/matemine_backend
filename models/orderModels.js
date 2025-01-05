const db = require("../db/db-pool");
const cart = require("./cartModels");

async function createOrder(
  stripeCustomerId,
  totalPrice,
  paymentIntentId,
  receiptUrl
) {
  try {
    const result = await db.query(
      `INSERT INTO orders(stripe_customer_id, total_price, payment_intent_id, receipt_url) VALUES($1, $2, $3, $4) RETURNING *`,
      [stripeCustomerId, totalPrice, paymentIntentId, receiptUrl]
    );
    if (result.length === 1) {
      return result[0];
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

async function insertOrderItems(stripeCustomerId, orderId) {
  try {
    const userIdResult = await db.query(
      `SELECT user_id FROM users WHERE stripe_customer_id = $1`,
      [stripeCustomerId]
    );
    if (userIdResult.length === 1) {
      const userId = userIdResult[0].user_id;
      if (userId) {
        const cartId = await cart.getCartId(userId);
        if (cartId) {
          const cartItems = await db.query(
            `SELECT game_id, quantity FROM cart_items WHERE cart_id = $1`,
            [cartId]
          );
          if (cartItems.length > 0) {
            const insertedItems = await db.transaction(async (client) => {
              const insertPromises = cartItems.map((cartItem) => {
                return client.query(
                  `INSERT INTO order_items (game_id, quantity, order_id) VALUES ($1, $2, $3) RETURNING *`,
                  [cartItem.game_id, cartItem.quantity, orderId]
                );
              });

              const results = await Promise.all(insertPromises);
              return results.map((result) => result.rows);
            });
            if (insertedItems.length === cartItems.length) {
              return true;
            }
          }
        }
      }
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

async function getAllOrders(userId) {
  try {
    const stripeCustomerIdResult = await db.query(
      `SELECT stripe_customer_id FROM users WHERE user_id = $1`,
      [userId]
    );
    if (stripeCustomerIdResult.length === 1) {
      const stripeCustomerId = stripeCustomerIdResult[0].stripe_customer_id;
      const items = await db.query(
        `SELECT 
    o.order_id,
    o.order_date,
    o.total_price,
    o.order_status,
    o.receipt_url,
    COALESCE(
        json_agg(
            json_build_object(
                'game_id', oi.game_id,
                'quantity', oi.quantity,
                'title', g.title,
                'price', g.price,
                'sample_cover_thumbnail', g.sample_cover_thumbnail
            )
        ) FILTER (WHERE oi.order_item_id IS NOT NULL),
        '[]'
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN games g ON oi.game_id = g.game_id
WHERE o.stripe_customer_id = $1
GROUP BY o.order_id
ORDER BY o.order_date DESC;`,
        [stripeCustomerId]
      );
      return items.length > 0 ? items : [];
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { createOrder, insertOrderItems, getAllOrders };
