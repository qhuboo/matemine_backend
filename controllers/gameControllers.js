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
  const result = await getAllGames();
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
