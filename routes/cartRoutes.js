const express = require("express");
const router = express.Router();
const { asyncWrapper } = require("../utils");

const cart = require("../controllers/cartControllers");

router.post("/add", asyncWrapper(cart.addToCart));

module.exports = router;
