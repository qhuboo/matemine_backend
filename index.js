const express = require("express");
const app = express();

const PORT = 8080;

app.get("/", (req, res) => {
  res.end("This is the matemine backend");
});

app.get("/fail", (req, res) => {
  throw new Error("Nope!");
});

// 404 Page
app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 - Not Found");
});

app.listen(PORT, () => {
  console.log(`Express started on port ${PORT}`);
});
