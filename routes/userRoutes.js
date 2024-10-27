const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.send("Hello");
});

router.post("/signin", (req, res) => {
  console.log(req.body);
  res.send("The request made it");
});

module.exports = router;
