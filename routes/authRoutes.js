const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

router.post(
  "/register",
  [
    // Array of validation middleware functions
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter.")
      .matches(/\d/)
      .withMessage("Password must contain at least one number.")
      .matches(/[@$!%*?&#]/)
      .withMessage("Password must contain at least one special character."),
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required.")
      .matches(/^[a-zA-Z '-]+$/)
      .withMessage("First name contains invalid characters.")
      .escape(),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required.")
      .matches(/^[a-zA-Z '-]+$/)
      .withMessage("Last name contains invalid characters.")
      .escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    res.json({ message: "Hello" });
  }
);

router.post(
  "/login",
  [
    // Array of validation middleware functions
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    res.json({ message: "Hello" });
  }
);

module.exports = router;
