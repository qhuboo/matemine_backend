const bcrypt = require("bcrypt");
const { getUser, createUser } = require("../models/userModels");
const { validationResult } = require("express-validator");
const { ValidationError, AuthenticationError } = require("../errorTypes");

async function registerUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials: ${allErrors}`);
  }

  const { email, password, firstName, lastName } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const newUser = { firstName, lastName, email, hash };
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

async function loginUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials: ${allErrors}`);
  }

  const { email, password } = req.body;
  const user = await getUser(email);

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
    throw new AuthenticationError("Error validating credentials");
  }
}

module.exports = { registerUser, loginUser };
