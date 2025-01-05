const express = require("express");
const router = express.Router();
const orderControllers = require("../controllers/orderControllers");

const { asyncWrapper } = require("../utils");

router.get("/", asyncWrapper(orderControllers.getAllOrders));

module.exports = router;
