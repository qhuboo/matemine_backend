const express = require("express");
const router = express.Router();
const { asyncWrapper } = require("../utils");

const cart = require("../controllers/cartControllers");

router.get("/", asyncWrapper(cart.getCart));
router.post("/add", asyncWrapper(cart.addToCart));
router.post("/quantity", asyncWrapper(cart.changeGameQuantityController));
router.post("/remove", asyncWrapper(cart.removeFromCartController));

module.exports = router;
