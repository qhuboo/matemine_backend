const express = require("express");
const router = express.Router();
const { asyncWrapper } = require("../utils");
const auth = require("../controllers/authControllers");
const registerValidation = require("../middleware/registerInputValidation");
const loginValidation = require("../middleware/loginInputValidation");

router.post("/register", registerValidation, asyncWrapper(auth.registerUser));

router.post("/login", loginValidation, asyncWrapper(auth.loginUser));

router.post("/logout", asyncWrapper(auth.logoutUser));

router.post("/refresh", asyncWrapper(auth.refreshTokens));

module.exports = router;
