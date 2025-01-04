const db = require("../db/db-pool");
const { DatabaseError } = require("../errorTypes");

async function addCart(userId) {
  try {
    const result = await db.query(
      `INSERT INTO shopping_carts (user_id)
  SELECT $1
  WHERE NOT EXISTS (
    SELECT 1
    FROM shopping_carts
    WHERE user_id = $1
  ) RETURNING *`,
      [userId]
    );
    if (result.length === 1) {
      return result[0];
    }
  } catch (error) {
    console.log(error);
  }
}

async function getCartId(userId) {
  try {
    const result = await db.query(
      "SELECT cart_id FROM shopping_carts WHERE user_id = $1",
      [userId]
    );
    if (result.length === 1) {
      return result[0].cart_id;
    }
    return undefined;
  } catch (error) {
    console.log(error);
  }
}

// This function should be the api facing one
async function getCartItems(cartId) {
  try {
    const result = await db.query(
      `SELECT g.*, ci.quantity
FROM games g
JOIN cart_items ci ON g.game_id = ci.game_id
WHERE ci.cart_id = $1 ORDER BY g.title ASC`,
      [cartId]
    );
    if (result.length > 0) {
      return result;
    }
    return [];
  } catch (error) {
    console.log(error);
  }
}

async function insertGame(cartId, gameId, quantity) {
  try {
    const result = await db.query(
      `INSERT INTO cart_items (cart_id, game_id, quantity) VALUES($1, $2, $3) RETURNING *`,
      [cartId, gameId, quantity]
    );

    if (result.length === 1) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error);
  }
}

async function changeGameQuantity(cartId, gameId, quantity) {
  try {
    const result = await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND game_id = $3 RETURNING *`,
      [quantity, cartId, gameId]
    );

    if (result.length === 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

async function removeGameFromCart(cartId, gameId) {
  try {
    const result = await db.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND game_id = $2 RETURNING *`,
      [cartId, gameId]
    );
    if (result.length === 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
}

async function calculateCartTotal(cartId) {
  try {
    const cartItems = await getCartItems(cartId);
    if (cartItems.length > 0) {
      const total = cartItems.reduce((accumulatedCost, currentGame) => {
        return (
          accumulatedCost +
          Number(currentGame.quantity) * parseFloat(currentGame.price)
        );
      }, 0);

      return total;
    }
    return 0;
  } catch (error) {
    console.log(error);
  }
}

async function clearCartPaymentIntent(paymentIntentId) {
  try {
    // console.log("clearCartPaymentIntent");
    const cartResult = await db.query(
      "SELECT cart_id FROM payment_intents WHERE id = $1",
      [paymentIntentId]
    );
    if (cartResult.length === 1) {
      console.log(cartResult);
      const cartId = cartResult[0].cart_id;
      console.log("cartId: ", cartId);
      const result = await db.query(
        "DELETE FROM cart_items WHERE cart_id = $1 RETURNING *",
        [cartId]
      );
      if (result.length > 0) {
        console.log("Deleting items:");
        console.log(result);
        return true;
      } else {
        console.log("Error deleting items from cart");
        return false;
      }
    } else {
      console.log("Error getting the cart id from the payment intent");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  addCart,
  getCartId,
  getCartItems,
  insertGame,
  changeGameQuantity,
  removeGameFromCart,
  calculateCartTotal,
  clearCartPaymentIntent,
};
