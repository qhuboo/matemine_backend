const bcrypt = require("bcrypt");
const { getUser, createUser } = require("../models/userModels");
const { validationResult } = require("express-validator");
const { ValidationError, AuthenticationError } = require("../errorTypes");

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

  if (createdUser) {
    res.json({
      isRegistered: true,
      firstName,
      lastName,
      email,
      admin,
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
      res.json({
        isAuthenticated: true,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        admin: user.admin,
        token:
          "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTczMzAyODc4OSwiaWF0IjoxNzMzMDI4Nzg5fQ.m-tzQ28-DU7r3OcBrBGaXGzbq0b1peFE7naniDwZACg",
      });
    } else {
      throw new AuthenticationError("Authentication failed");
    }
  } else {
    throw new AuthenticationError("Authentication failed");
  }
}

module.exports = { registerUser, loginUser };
