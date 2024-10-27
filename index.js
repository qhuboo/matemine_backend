const express = require("express");
const app = express();
const cors = require("cors");

const PORT = 8080;

const games = require("./routes/gameRoutes");
const users = require("./routes/userRoutes");

// Ensure the server trusts the proxy
app.set("trust proxy", true);

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello");
});

app.use("/games", games);
app.use("/users", users);

app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 - Not Fo0000und");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception\n", err.stack);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Express started on port ${PORT}`);
});
