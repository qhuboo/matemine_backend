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
const orders = require("./routes/orderRoutes");

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
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        h1 { color: #333; }
        pre { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        ul { list-style: none; padding: 0; }
        ul li { margin-bottom: 10px; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>API Documentation for /games</h1>
      <h2>Endpoint</h2>
      <p><code>GET /games</code></p>
      <h2>Description</h2>
      <p>This endpoint retrieves a list of games based on the provided filters, pagination, and sorting options.</p>
      <h2>Query Parameters</h2>
      <h3>Filter Parameters</h3>
      <ul>
        <li><code>nintendo</code>: Comma-separated list of Nintendo consoles.</li>
        <li><code>sega</code>: Comma-separated list of SEGA consoles.</li>
        <li><code>playstation</code>: Comma-separated list of PlayStation consoles.</li>
        <li><code>xbox</code>: Comma-separated list of Xbox consoles.</li>
      </ul>
      <h3>Pagination Parameters</h3>
      <ul>
        <li><code>perPage</code>: Number of games per page (valid: 12, 24, 48, 76).</li>
        <li><code>page</code>: Page number (must be a positive integer).</li>
      </ul>
      <h3>Sorting Parameters</h3>
      <ul>
        <li><code>sort</code>: Sorting options (e.g., <code>alpha-asc</code>, <code>rating-desc</code>, etc.).</li>
      </ul>
      <h2>Response Format</h2>
      <pre>
{
  "games": [
    { "game_id": 1, "title": "Game Title", "rating": 4.5, "price": 59.99, "platforms": ["Nintendo Switch", "Xbox Series"] }
  ],
  "totalPages": 10
}
      </pre>
    </body>
    </html>
  `);
});

app.use("/games", games);
app.use("/auth", auth);
app.use("/cart", tokenAuthMiddleware, cart);
app.use("/stripe", tokenAuthMiddleware, stripe);
app.use("/orders", tokenAuthMiddleware, orders);

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
