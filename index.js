const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("node:fs");

const PORT = 8080;

// Ensure the server trusts the proxy
app.set("trust proxy", true);

// Define a new Morgan token to extract the IP
morgan.token("remote-addr", function (req) {
  return req.headers["x-forwarded-for"] || req.ip;
});

switch (app.get("env")) {
  case "development":
    app.use(
      morgan(
        ":remote-addr - :method :url :status :response-time ms - :res[content-length]"
      )
    );
    break;
  case "production":
    const stream = fs.createWriteStream(__dirname + "/access.log", {
      flags: "a",
    });
    app.use(morgan("combined", { stream }));
    break;
}

app.get("/", (req, res) => {
  res.end("This is the matemine backend");
});

app.get("/fail", (req, res) => {
  throw new Error("Nope!");
});

app.get("/epic-fail", (req, res) => {
  process.nextTick(() => {
    throw new Error("KABOOM!");
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  if (!res.headersSent) {
    res.status(500).send("Interval Server Error");
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception\n", err.stack);
  process.exit(1);
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
