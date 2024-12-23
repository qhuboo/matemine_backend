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
    if (result.length > 0) {
      return true;
    }
    return false;
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
};
