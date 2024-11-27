const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  if (req.body) {
    console.log(req.body);
  }

  res.json({ message: "Hello" });
});

router.post("/login", (req, res) => {
  if (req.body) {
    console.log(req.body);
  }

  res.json({ message: "Hello" });
});

module.exports = router;
