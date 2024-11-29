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
      .matches(/[@$!%*?&#-]/)
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
      const allErrors = errors.errors.map((error) => error.msg);
      return res.status(400).json({ ok: false, errors: allErrors });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);

      const newUser = { firstName, lastName, email, hash };

      const user = await getUser(email);
      if (user) {
        return res
          .status(409)
          .send({ ok: false, message: "The user already exists" });
      } else {
        const createdUser = await createUser(newUser);
        if (createdUser) {
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
        ok: false,
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
    body("password").notEmpty().withMessage("Please enter a password"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const allErrors = errors.errors.map((error) => error.msg);
      return res.status(400).json({ ok: false, errors: allErrors });
    }

    const { email, password } = req.body;
    try {
      const user = await getUser(email);
      if (user) {
        const hashedPassword = user.password;
        const match = await bcrypt.compare(password, hashedPassword);
        if (match) {
          res.json({
            msg: "Login Successful",
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
          });
        } else {
          res.status(401).json({ msg: "Invalid credentials" });
        }
      } else {
        res.status(401).json({ msg: "Invalid credentials" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "There was an error on the server" });
    }
  }
);

module.exports = router;
