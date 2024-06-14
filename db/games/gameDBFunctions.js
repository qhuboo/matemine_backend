const db = require("../db-pool");

async function getAllGames() {
  try {
    const games = await db.query("SELECT * FROM games");
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

async function deleteGame(game_id) {
  try {
    const response = await db.query(
      `UPDATE games SET available=false WHERE game_id = $1`,
      [game_id]
    );
    // TODO: verify that the game is indeed no longer available and return 0, throw an error otherwise
    return response;
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    const response = await deleteGame(15);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}

main();
