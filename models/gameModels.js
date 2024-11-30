const db = require("../db/db-pool");
const { DatabaseError } = require("../errorTypes");

async function getAllGames() {
  try {
    const games = await db.query("SELECT * FROM games LIMIT 30");

    return games;
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching all games: ${err.message}`
    );
  }
}

async function getAllAvailableGames() {
  try {
    const games = await db.query("SELECT * FROM games WHERE available=$1", [
      true,
    ]);

    return games;
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching all available games: ${err.message}`
    );
  }
}

async function getGamesByPlatform(platform_id) {
  try {
    const games = await db.query(
      "SELECT * FROM games WHERE game_id IN (SELECT game_id from game_platforms WHERE platform_id = $1 and AVAILABLE=true)",
      [platform_id]
    );

    return games;
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching games by platform: ${err.message}`
    );
  }
}

async function getGameById(game_id) {
  try {
    const game = await db.query("SELECT * FROM games WHERE game_id = $1", [
      game_id,
    ]);

    return game[0];
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching game by id: ${err.message}`
    );
  }
}

async function getGameByTitle(game_title) {
  try {
    const game = await db.query("SELECT * FROM games WHERE title = $1", [
      game_title,
    ]);

    return game[0];
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching game by title: ${err.message}`
    );
  }
}

async function getPlatformId(platform_name) {
  try {
    const id = await db.query(
      "SELECT platform_id FROM platforms WHERE platform_name = $1",
      [platform_name]
    );

    return id[0].platform_id;
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching platform id by platform name: ${err.message}`
    );
  }
}

async function getGameScreenshots(game_id) {
  try {
    const screenshots = await db.query(
      "SELECT g.game_id, g.description, g.title, g.price, g.sample_cover_image, gs.caption, gs.image FROM games g JOIN game_screenshots gs ON g.game_id = gs.game_id WHERE g.game_id = $1",
      [game_id]
    );
    return screenshots;
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching game screenshots: ${err.message}`
    );
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
