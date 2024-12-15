const express = require("express");
const router = express.Router();
const { asyncWrapper } = require("../utils");

router.post("/add", (req, res, next) => {
  try {
    console.log(req.body);
  } catch (error) {
    throw error;
  }
});

module.exports = router;
