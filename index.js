const config = require("./config");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// For development
const fs = require("fs");
const https = require("https");

const PORT = config.port || 3000;

const games = require("./routes/gameRoutes");
const auth = require("./routes/authRoutes");
const cart = require("./routes/cartRoutes");
const stripe = require("./routes/stripeRoutes");
const stripeWebhook = require("./routes/stripeWebhook");

const tokenAuthMiddleware = require("./middleware/tokenAuthMiddleware");
const { globalErrorHandler } = require("./globalErrorHandler");

// Ensure the server trusts the proxy
app.set("trust proxy", true);

app.use(
  cors({
    origin: [
      "https://localhost:5173",
      "https://matemine.shop",
      "https://www.matemine.shop",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Accept-Language",
      "Accept-Encoding",
      "Origin",
      "Cache-Control",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
  })
);

app.use("/stripe-webhook", stripeWebhook);

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
app.use("/cart", tokenAuthMiddleware, cart);
app.use("/stripe", tokenAuthMiddleware, stripe);

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

if (config.nodeEnv === "development") {
  const options = {
    key: fs.readFileSync("./localhost-8080-key.pem"),
    cert: fs.readFileSync("./localhost-8080.pem"),
  };

  https.createServer(options, app).listen(PORT);
} else {
  app.listen(PORT, () => {
    console.log(`Express started on port ${PORT}`);
  });
}
