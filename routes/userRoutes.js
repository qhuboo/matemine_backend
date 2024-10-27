const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.send("Hello");
});

router.post("/signin", (req, res) => {
  // console.log(Object.keys(req));
  console.log(Object.keys(req.body));

  res.json({ message: "the request made it" });
});

module.exports = router;
