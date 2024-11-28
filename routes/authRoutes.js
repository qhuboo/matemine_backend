const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { getUser, createUser } = require("../db/users/usersDBFunctions");

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);

      const user = { firstName, lastName, email, hash };

      const result = await getUser(email);
      if (result.length > 0) {
        return res.send({ ok: false, message: "The user already exists" });
      } else {
        const result = await createUser(user);
        if (result.length > 0) {
          res.json({
            message: "User successfully registered",
            firstName,
            lastName,
            email,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "There was an error on the server creating the user",
      });
    }
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
