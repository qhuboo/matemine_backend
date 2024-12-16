const { insertGame, getCartId } = require("../models/cartModels");

async function addToCart(req, res, next) {
  if (!req.body.gameId) {
    return res.status(400).json({ message: "Invalid game id" });
  }
  const { gameId } = req.body;
  const { userId } = req.user;
  const cartId = await getCartId(userId);
  if (cartId) {
    const insert = await insertGame(cartId, gameId);
    if (insert) {
      return res.json({ message: "The game was entered" });
    }
  }
}

module.exports = { addToCart };
