const orderModels = require("../models/orderModels");

async function getAllOrders(req, res, next) {
  try {
    if (req.user?.userId) {
      const userId = req.user.userId;
      const items = await orderModels.getAllOrders(userId);
      if (items.length > 0) {
        return res.json(items);
      } else {
        return res.json([]);
      }
    }
  } catch (error) {
    throw error;
  }
}

module.exports = { getAllOrders };
