const db = require("../db-pool");

async function getAllGames() {
  try {
    const games = await db.query("SELECT * FROM games LIMIT 30");
    if (games.length === 0) {
      throw new Error("Error finding games");
    }
    return games;
  } catch (error) {
    throw error;
  }
}

async function getAllAvailableGames() {
  try {
    const games = await db.query("SELECT * FROM games WHERE available=$1", [
      true,
    ]);
    if (games.length === 0) {
      throw new Error("Error finding available games");
    }
    return games;
  } catch (error) {
    throw error;
  }
}

async function getGamesByPlatform(platform_id) {
  try {
    const games = await db.query(
      "SELECT * FROM games WHERE game_id IN (SELECT game_id from game_platforms WHERE platform_id = $1 and AVAILABLE=true)",
      [platform_id]
    );
    if (games.length === 0) {
      throw new Error(`Error finding games with platform_id: ${platform_id}`);
    }
    return games;
  } catch (error) {
    throw error;
  }
}

async function getGameById(game_id) {
  try {
    const game = await db.query("SELECT * FROM games WHERE game_id = $1", [
      game_id,
    ]);
    if (game.length === 0) {
      throw new Error(`Error finding game with game_id: ${game_id}`);
    }
    return game[0];
  } catch (error) {
    throw error;
  }
}

async function getGameByTitle(game_title) {
  try {
    const game = await db.query("SELECT * FROM games WHERE title = $1", [
      game_title,
    ]);
    if (game.length === 0) {
      throw new Error(`Error finding game with game_title: ${game_title}`);
    }
    return game[0];
  } catch (error) {
    throw error;
  }
}

async function getPlatformId(platform_name) {
  try {
    const id = await db.query(
      "SELECT platform_id FROM platforms WHERE platform_name = $1",
      [platform_name]
    );
    if (id.length === 0) {
      throw new Error(
        `Error getting the platform_id for platform with name: ${platform_name}`
      );
    }
    return id[0].platform_id;
  } catch (error) {
    throw error;
  }
}

async function getGameScreenshots(game_id) {
  try {
    const screenshots = await db.query(
      "SELECT g.game_id, g.description, g.title, g.price, g.sample_cover_image, gs.caption, gs.image FROM games g JOIN game_screenshots gs ON g.game_id = gs.game_id WHERE g.game_id = $1",
      [game_id]
    );
    return screenshots;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllGames,
  getAllAvailableGames,
  getGamesByPlatform,
  getGameById,
  getGameByTitle,
  getPlatformId,
  getGameScreenshots,
};
