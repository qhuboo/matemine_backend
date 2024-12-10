const {
  getAllGames,
  getAllAvailableGames,
  getGamesByPlatform,
  getGameById,
  getGameByTitle,
  getPlatformId,
  getGameScreenshots,
} = require("../models/gameModels");

async function getAllGamesController(req, res) {
  // Consoles
  const nintendo = req.query?.nintendo
    ? req.query?.nintendo.split(",")
    : undefined;

  const sega = req.query?.sega ? req.query?.sega.split(",") : undefined;

  const playstation = req.query?.playstation
    ? req.query?.playstation.split(",")
    : undefined;

  const xbox = req.query?.xbox ? req.query?.xbox.split(",") : undefined;

  let consoles = [];
  if (nintendo) {
    consoles = [...nintendo, ...consoles];
  }
  if (sega) {
    consoles = [...sega, ...consoles];
  }
  if (playstation) {
    consoles = [...playstation, ...consoles];
  }
  if (xbox) {
    consoles = [...xbox, ...consoles];
  }

  const options = {
    perPage: req.query?.perPage ? req.query?.perPage : undefined,
    page: req.query?.page ? req.query?.page : undefined,
    sort: req.query?.sort ? req.query?.sort : undefined,
    consoles,
  };

  const result = await getAllGames(options);
  res.json(result);
}

async function getAllAvailableGamesController(req, res) {
  const result = await getAllAvailableGames();
  res.json(result);
}

async function getGamesByPlatformController(req, res) {
  const result = await getGamesByPlatform(req.params.platform_id);
  res.json(result);
}

async function getGameByIdController(req, res) {
  const result = await getGameById(req.params.id);
  res.json(result);
}

async function getGameByTitleController(req, res) {
  const result = await getGameByTitle(req.params.title);
  res.json(result);
}

async function getPlatformIdController(req, res) {
  const result = await getPlatformId(req.params.platform_name);
  res.json(result);
}

async function getGameScreenshotsController(req, res) {
  const result = await getGameScreenshots(req.params.game_id);
  res.json(result);
}

module.exports = {
  getAllGamesController,
  getAllAvailableGamesController,
  getGamesByPlatformController,
  getGameByIdController,
  getGameByTitleController,
  getPlatformIdController,
  getGameScreenshotsController,
};
