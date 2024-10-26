const express = require("express");
const router = express.Router();

router.get("/register", (req, res) => {
  res.send("Hello");
});

router.post("/signin", (req, res) => {
  console.log(req.body);
});

module.exports = router;
