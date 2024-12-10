const config = require("./config");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const PORT = config.port || 3000;

const games = require("./routes/gameRoutes");
const auth = require("./routes/authRoutes");

const tokenAuthMiddleware = require("./middleware/tokenAuthMiddleware");
const { globalErrorHandler } = require("./globalErrorHandler");

// Ensure the server trusts the proxy
app.set("trust proxy", true);

app.use(cors({ origin: ["http://localhost:5173", "https://matemine.shop"] }));

app.use(express.json());

app.use(cookieParser(config.cookieSecret));

// Middleware to catch JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next(err);
});

app.get("/", async (req, res) => {
  res.send("Hello");
});

app.use("/games", games);
app.use("/auth", auth);
app.post("/protected", tokenAuthMiddleware, (req, res) => {
  res.json({ message: "Got into the protected route" });
});

// 404
app.use((req, res) => {
  res.status(404).json("404 - Not Found");
});

// Global Error handler
app.use(globalErrorHandler);

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Uncaught Exception\n", err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  console.error("Uncaught Exception\n", err.stack);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Express started on port ${PORT}`);
});
