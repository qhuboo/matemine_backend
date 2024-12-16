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

async function insertGame(cartId, gameId) {
  try {
    const result = await db.query(
      "INSERT INTO cart_items (cart_id, game_id) VALUES($1, $2) RETURNING *",
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

module.exports = { addCart, getCartId, insertGame };
