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
      <title>Matemine.shop API Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        h1 { color: #333; }
        pre { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
        ul { list-style: none; padding: 0; }
        ul li { margin-bottom: 10px; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
        .section { margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <h1>Welcome to the Matemine.shop API!</h1>
      <p>This is the official API for the <strong>Matemine.shop</strong> marketplace, where you can browse and access data about video games.</p>
      <p>Our data is sourced from <strong>Moby Games</strong>, and most routes in this API require <strong>token authentication</strong> for security. However, the <code>/games</code> route can be accessed directly from the browser without authentication.</p>
      <p>Below, you'll find documentation for the <code>/games</code> route, including how to use its query parameters to filter, sort, and paginate your search results.</p>

      <div class="section">
        <h2>Endpoint</h2>
        <p><code>GET /games</code></p>
      </div>
      
      <div class="section">
        <h2>Description</h2>
        <p>This endpoint retrieves a list of games based on the provided filters, pagination, and sorting options.</p>
      </div>
      
      <div class="section">
        <h2>Query Parameters</h2>
        
        <h3>Filter Parameters</h3>
        <ul>
          <li><code>nintendo</code>: Specify a comma-separated list of Nintendo consoles (e.g., <code>SNES, Wii</code>).</li>
          <li><code>sega</code>: Specify a comma-separated list of SEGA consoles (e.g., <code>Genesis, Dreamcast</code>).</li>
          <li><code>playstation</code>: Specify a comma-separated list of PlayStation consoles (e.g., <code>PSP, PlayStation 5</code>).</li>
          <li><code>xbox</code>: Specify a comma-separated list of Xbox consoles (e.g., <code>Xbox, Xbox Series</code>).</li>
        </ul>
        <p><strong>Examples:</strong></p>
        <pre>
?nintendo=SNES,Wii
?sega=Genesis,Dreamcast
?playstation=PlayStation%205,PSP
?xbox=Xbox,Xbox%20Series
        </pre>
      </div>
    
      <div class="section">
        <h3>Pagination Parameters</h3>
        <ul>
          <li><code>perPage</code>: The number of games per page. Valid values: <code>12</code>, <code>24</code>, <code>48</code>, <code>76</code>. Default: <code>12</code>.</li>
          <li><code>page</code>: The page number to fetch. Must be a positive integer. Default: <code>1</code>.</li>
        </ul>
        <p><strong>Examples:</strong></p>
        <pre>
?perPage=24
?page=2
        </pre>
      </div>
      
      <div class="section">
        <h3>Sorting Parameters</h3>
        <ul>
          <li><code>sort</code>: Determines the sorting order of games. Valid values:
            <ul>
              <li><code>alpha-desc</code>: Sort by title in descending order (Z → A).</li>
              <li><code>alpha-asc</code>: Sort by title in ascending order (A → Z).</li>
              <li><code>rating-desc</code>: Sort by rating in descending order.</li>
              <li><code>rating-asc</code>: Sort by rating in ascending order.</li>
              <li><code>price-desc</code>: Sort by price in descending order (highest → lowest).</li>
              <li><code>price-asc</code>: Sort by price in ascending order (lowest → highest).</li>
            </ul>
          </li>
        </ul>
        <p><strong>Examples:</strong></p>
        <pre>
?sort=rating-asc
?sort=price-desc
        </pre>
      </div>
      
      <div class="section">
        <h2>Response Format</h2>
        <pre>
{
  "games": [
    {
      "game_id": 500,
      "title": "Star Wars: Dark Forces",
      "description": "Kyle Katarn is a former Imperial officer turned mercenary, now hired by the Rebel Alliance. After having stolen the Death Star plans ...",
      "price": "36.31",
      "rating": "7.90",
      "sample_cover_image": "https://cdn.mobygames.com/covers/4144523-star-wars-dark-forces-dos-front-cover.jpg",
      "sample_cover_thumbnail": "https://cdn.mobygames.com/64f827c0-aba7-11ed-99ae-02420a00019e.webp",
      "available": true
    },
    ...
  ],
  "totalPages": 10
}
        </pre>
      </div>
      
      <div class="section">
        <h2>Example Requests</h2>
        <ul>
          <li>Get all games for Nintendo consoles (SNES, Wii) sorted by rating in ascending order:</li>
          <pre>GET /games?nintendo=SNES,Wii&sort=rating-asc</pre>
          
          <li>Get PlayStation games (PS5, PSP) on page 2 with 24 results per page:</li>
          <pre>GET /games?playstation=PlayStation%205,PSP&perPage=24&page=2</pre>
          
          <li>Get all Xbox games sorted by price in descending order:</li>
          <pre>GET /games?xbox=Xbox,Xbox%20Series&sort=price-desc</pre>
          
          <li>Fetch games from multiple platforms (e.g., Nintendo Wii, Sega Genesis, Xbox Series):</li>
          <pre>GET /games?nintendo=Wii&sega=Genesis&xbox=Xbox%20Series</pre>
        </ul>
      </div>
      
      <div class="section">
        <h2>Error Handling</h2>
        <p>If an invalid parameter value is provided (e.g., unsupported <code>sort</code> option), the server will replace it with the default value,
        <code>alpha-desc</code> in this case.</p>
 
        <p>If no games match the specified filters, the server will return an empty response:</p>
        <pre>
{
  "games": [],
  "totalPages": 0
}
        </pre>
      </div>
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
