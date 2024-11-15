const express = require("express");
const router = express.Router();

router.post("/register", (req, res) => {
  res.send("Hello");
});

router.post("/login", (req, res) => {
  console.log(req.body.email);
  console.log(req.body.password);

  // Some sql logic to check password hash and email

  const error = false;
  // const error = true;
  if (!error) {
    // Success Status
    res.status(201).json({ message: "Successful login" });
  } else {
    // Error Status
    res.status(500).json({
      message: "This is the success message",
      error: "This is the error message",
    });
  }
});

module.exports = router;
