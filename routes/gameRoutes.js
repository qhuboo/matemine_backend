const express = require("express");
const router = express.Router();

const games = require("../db/games/gameDBFunctions");

router.get("/", async (req, res) => {
  try {
    const response = await games.getAllGames();
    res.json(response);
  } catch (error) {
    throw error;
  }
});

router.get("/available", async (req, res) => {
  try {
    const response = await games.getAllAvailableGames();
    res.json(response);
  } catch (error) {
    throw error;
  }
});

module.exports = router;
