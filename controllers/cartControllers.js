const { insertGame } = require("../models/cartModels");

async function addToCart(req, res, next) {
  console.log(req.body);
  const { gameId } = req.body.game;
  const { email } = req.body;
  console.log(gameId);
  console.log(email);
  return res.json({ message: "You hit the add to cart route" });
}

module.exports = { addToCart };
