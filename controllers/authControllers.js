const bcrypt = require("bcrypt");
const { getUser, createUser } = require("../models/authModels");
const { validationResult } = require("express-validator");
const { ValidationError, AuthenticationError } = require("../errorTypes");
const { generateTokens } = require("../utils");

async function registerUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials`, allErrors);
  }

  const { email, password, firstName, lastName } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const newUser = { firstName, lastName, email, hash };
  const createdUser = await createUser(newUser);
  console.log(createdUser);

  if (createdUser) {
    const { accessToken, refreshToken } = generateTokens(createdUser.email);
    console.log(accessToken);
    console.log(refreshToken);
    res.json({
      isAuthenticated: true,
      email: createdUser.email,
      firstName: createdUser.first_name,
      lastName: createdUser.last_name,
      admin: createdUser.admin,
      accessToken,
      refreshToken,
    });
  }
}

async function loginUser(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const allErrors = errors.errors.map((error) => error.msg);
    throw new ValidationError(`Error validating credentials`, allErrors);
  }

  const { email, password } = req.body;
  const user = await getUser(email);

  if (user) {
    const hashedPassword = user.password;
    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
      const { accessToken, refreshToken } = generateTokens(user.email);
      console.log(accessToken);
      console.log(refreshToken);
      res.json({
        isAuthenticated: true,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        admin: user.admin,
        accessToken,
        refreshToken,
      });
    } else {
      throw new AuthenticationError("Authentication failed");
    }
  } else {
    throw new AuthenticationError("Authentication failed");
  }
}

module.exports = { registerUser, loginUser };
