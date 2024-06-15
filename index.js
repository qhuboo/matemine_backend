const express = require("express");
const app = express();

const PORT = 8080;

const { getAllGames } = require("./db/games/gameDBFunctions");

// Ensure the server trusts the proxy
app.set("trust proxy", true);

app.get("/games", async (req, res) => {
  const games = await getAllGames();
  res.json(games);
});

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
