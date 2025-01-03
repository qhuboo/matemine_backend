const { body } = require("express-validator");

const registerValidation = [
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
];

module.exports = registerValidation;
