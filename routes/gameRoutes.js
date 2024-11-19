const express = require("express");
const router = express.Router();

const games = require("../db/games/gameDBFunctions");

router.get("/", async (req, res) => {
  try {
    console.log("Hit");
    if (req.query.nintendo) {
      console.log(req.query.nintendo);
    }
    if (req.query.sega) {
      console.log(req.query.sega);
    }
    if (req.query.playstation) {
      console.log(req.query.playstation);
    }
    if (req.query.xbox) {
      console.log(req.query.xbox);
    }

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

router.get("/platform/:platform_id", async (req, res) => {
  try {
    const response = await games.getGamesByPlatform(req.params.platform_id);
    res.json(response);
  } catch (error) {
    throw error;
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await games.getGameById(req.params.id);
    res.json(response);
  } catch (error) {
    throw error;
  }
});

router.get("/:title", async (req, res) => {
  try {
    const response = await games.getGameByTitle(req.params.title);
    res.json(response);
  } catch (error) {
    throw error;
  }
});

router.get("/platforms/:platform_name", async (req, res) => {
  try {
    const response = await games.getPlatformId(req.params.platform_name);
    res.json(response);
  } catch (error) {
    throw error;
  }
});

router.get("/screenshots/:game_id", async (req, res) => {
  try {
    const response = await games.getGameScreenshots(req.params.game_id);
    res.json(response);
  } catch (error) {
    throw error;
  }
});

module.exports = router;
