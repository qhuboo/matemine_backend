const jwt = require("jsonwebtoken");
const config = require("../config");
const { getUser } = require("../models/authModels");

async function tokenAuthMiddlware(req, res, next) {
  try {
    const authHeaders = req.headers.authorization;
    if (!authHeaders?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const accessToken = authHeaders.split(" ")[1];

    // Verify access token
    const decoded = jwt.verify(accessToken, config.accessTokenSecret);

    // Check token version against database
    const user = getUser(decoded.email);

    console.log(user);
    if (user) {
      if (decoded.tokenVersion !== user.token_version) {
        res.status(401).json({ message: "Token version is invalid" });
      }
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = tokenAuthMiddlware;
