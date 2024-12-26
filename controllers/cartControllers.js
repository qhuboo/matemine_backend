const {
  insertGame,
  getCartId,
  getCartItems,
  changeGameQuantity,
  removeGameFromCart,
} = require("../models/cartModels");

async function addToCart(req, res, next) {
  // console.log("addToCart");
  if (!req.body.gameId && !req.body.quantity) {
    return res.status(400).json({ message: "Bad request" });
  }
  const gameId = Number(req.body.gameId);
  const quantity = Number(req.body.quantity);

  const { userId } = req.user;

  const cartId = await getCartId(userId);
  const cartItems = await getCartItems(cartId);

  // If the game is already in the card just update the quantity
  if (
    cartItems.some((game) => {
      if (game.game_id === gameId) {
        return true;
      }
      return false;
    })
  ) {
    // If so find the game and update the quantity
    const gameToUpdate = cartItems.find((game) => game.game_id === gameId);
    let updateQuantity = Number(quantity) + Number(gameToUpdate.quantity);
    if (cartId) {
      const insert = await changeGameQuantity(cartId, gameId, updateQuantity);
      if (insert) {
        return res.json({ message: "Game was added" });
      }
    }
  } else {
    const insert = await insertGame(cartId, gameId, quantity);
    if (insert) {
      return res.json({ message: "Game was added" });
    }
  }
  return res.json({ message: "Something went wrong" });
}

async function getCart(req, res, next) {
  // console.log("getCart");
  const { userId } = req.user;
  const cartId = await getCartId(userId);
  const cartItems = await getCartItems(cartId);
  return res.json(cartItems);
}

async function changeGameQuantityController(req, res, next) {
  // console.log("changeGameQuantityController");
  if (!req?.body?.gameId && !req?.body?.quantity) {
    return res.status(400).json({ message: "Bad request" });
  }
  const gameId = Number(req.body.gameId);
  const quantity = Number(req.body.quantity);

  const { userId } = req.user;
  const cartId = await getCartId(userId);
  const cartItems = await getCartItems(cartId);

  const gameToChange = cartItems.find(
    (cartGame) => cartGame.game_id === Number(gameId)
  );
  if (gameToChange) {
    const insert = await changeGameQuantity(cartId, gameId, quantity);
    if (insert) {
      return res.json({ message: "The quantity was updated" });
    }
  }
  return res.json({ message: "There was an error" });
}

async function removeFromCartController(req, res, next) {
  // console.log("removeFromCartController");
  if (!req?.body?.gameId) {
    return res.status(400).json({ message: "Bad request" });
  }
  const { userId } = req.user;
  const { gameId } = req.body;
  const cartId = await getCartId(userId);
  const cartItems = await getCartItems(cartId);
  if (cartItems.length > 0) {
    const gameToRemove = cartItems.find(
      (cartGame) => cartGame.game_id === Number(gameId)
    );
    if (gameToRemove) {
      const result = await removeGameFromCart(cartId, gameId);
      if (result) {
        return res.json({ message: "The game was removed" });
      }
    }
  }
}

module.exports = {
  addToCart,
  getCart,
  changeGameQuantityController,
  removeFromCartController,
};
