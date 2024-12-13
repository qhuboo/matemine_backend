const db = require("../db/db-pool");
const { DatabaseError } = require("../errorTypes");

async function getAllGames(options) {
  try {
    // Setting the sort option
    const validSortMappings = {
      "alpha-desc": { sortBy: "g.title", direction: "DESC" },
      "alpha-asc": { sortBy: "g.title", direction: "ASC" },
      "rating-desc": { sortBy: "g.rating", direction: "DESC" },
      "rating-asc": { sortBy: "g.rating", direction: "ASC" },
      "price-desc": { sortBy: "g.price", direction: "DESC" },
      "price-asc": { sortBy: "g.price", direction: "ASC" },
    };
    let columnSort = "g.title";
    let direction = "DESC";

    if (
      options.sort &&
      Object.keys(validSortMappings).includes(options?.sort)
    ) {
      columnSort = validSortMappings[options.sort].sortBy;
      direction = validSortMappings[options.sort].direction;
    }

    // Setting the perPage option
    let perPage = 12;
    const validPerPageOptions = ["12", "24", "48", "76"];
    if (validPerPageOptions.includes(options.perPage)) {
      perPage = options.perPage;
    }

    // Setting the page option
    let page = "1";
    const regex = new RegExp("^[0-9]+$");
    if (regex.test(options.page)) {
      page = parseInt(options.page);
    }

    const gamesQuery = `SELECT DISTINCT g.*
    FROM games g
    JOIN game_platforms gp ON g.game_id = gp.game_id
    JOIN platforms p ON gp.platform_id = p.platform_id
    WHERE (
    CARDINALITY($1::text[]) = 0   
    OR p.platform_name = ANY($1::text[]) 
)ORDER BY ${columnSort} ${direction} LIMIT ${perPage} OFFSET ${
      (page - 1) * perPage
    }`;

    const countQuery = `
      SELECT COUNT(DISTINCT g.game_id) AS total_count
      FROM games g
      JOIN game_platforms gp ON g.game_id = gp.game_id
      JOIN platforms p ON gp.platform_id = p.platform_id
      WHERE (
        CARDINALITY($1::text[]) = 0   
        OR p.platform_name = ANY($1::text[])
      );
    `;

    const [gamesResult, countResult] = await Promise.all([
      db.query(gamesQuery, [options.consoles]),
      db.query(countQuery, [options.consoles]),
    ]);

    const totalPages = Math.ceil(countResult[0].total_count / perPage);
    const finalResult = { games: gamesResult, totalPages };
    return finalResult;
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
