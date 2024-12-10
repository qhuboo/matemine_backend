const client = require("./db/gameData/db-client");

async function TestQuery() {
  try {
    await client.connect();
    const consoles = [
      "SNES",
      "Game Boy Advance",
      "Game Gear",
      "PlayStation 3",
      "PlayStation 4",
      "Xbox One",
      "Xbox Cloud Gaming",
    ];
    const { rows: platformIdList } = await client.query(
      "SELECT platform_id FROM platforms WHERE platform_name = ANY($1)",
      [consoles]
    );
    const platformIds = platformIdList.map((platform) => platform.platform_id);
    console.log(platformIdList);
    console.log(platformIds);

    const { rows: gameIdList } = await client.query(
      "SELECT game_id FROM game_platforms WHERE platform_id = ANY($1)",
      [platformIds]
    );
    console.log(gameIdList);
    const gameIds = gameIdList.map((game) => game.game_id);
    console.log(gameIds);

    const { rows: games } = await client.query(
      "SELECT * FROM games WHERE game_id = ANY($1)",
      [gameIds]
    );

    console.log(games);
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
}

TestQuery();
