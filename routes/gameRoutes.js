const express = require("express");
const router = express.Router();

const games = require("../controllers/gameControllers");
const { asyncWrapper } = require("../utils");

router.get("/", asyncWrapper(games.getAllGamesController));

router.get("/available", asyncWrapper(games.getAllAvailableGamesController));

router.get(
  "/platform/:platform_id",
  asyncWrapper(games.getGamesByPlatformController)
);

router.get("/:id", asyncWrapper(games.getGameByIdController));

router.get("/:title", asyncWrapper(games.getGameByTitleController));

router.get(
  "/platforms/:platform_name",
  asyncWrapper(games.getPlatformIdController)
);

router.get(
  "/screenshots/:game_id",
  asyncWrapper(games.getGameScreenshotsController)
);

module.exports = router;
