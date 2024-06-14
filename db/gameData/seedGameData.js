const client = require("./db-client");
const game_data = require("./game_data");

async function insertGame(game) {
  try {
    await client.query(
      "INSERT INTO games(game_id, title, description, price, sample_cover_image, sample_cover_thumbnail) VALUES($1, $2, $3, $4, $5, $6)",
      [
        game.game_id,
        game.title,
        game.description,
        game.price,
        game.sample_cover.image,
        game.sample_cover.thumbnail_image,
      ]
    );
  } catch (error) {
    throw error;
  }
}

async function seedGameData() {
  try {
    // Calling insertGame for each game object in the game_data array
    for (const game of game_data) {
      await insertGame(game);
    }
  } catch (error) {
    throw error;
  }
}

async function insertGamePlatform(game, platform) {
  try {
    // Insert query
    const insertQuery = `INSERT INTO game_platforms(game_id, platform_id, first_release_date)
      VALUES($1, $2, $3) RETURNING *`;

    // Values
    const values = [
      game.game_id,
      platform.platform_id,
      platform.first_release_date,
    ];

    // Running query
    console.log(
      `Inserting platform ${platform.platform_name} for ${game.title}`
    );
    const result = await client.query(insertQuery, values);
  } catch (error) {
    throw error;
  }
}

async function seedGamePlatforms() {
  try {
    // Calling insert each platform for each game in the game_array
    for (let i = 0; i < game_data.length; i++) {
      for (let j = 0; j < game_data[i].platforms.length; j++) {
        await insertGamePlatform(game_data[i], game_data[i].platforms[j]);
      }
    }
  } catch (error) {
    throw error;
  }
}

async function insertScreenshot(game, screenshot) {
  try {
    // Insert query
    const insertQuery = `INSERT INTO game_screenshots(game_id, caption, image, thumbnail_image)
      VALUES($1, $2, $3, $4)
      RETURNING *`;

    // Values
    const values = [
      game.game_id,
      screenshot.caption,
      screenshot.image,
      screenshot.thumbnail_image,
    ];

    // Running query
    console.log(`Inserting screenshot for ${game.title}...`);
    const result = await client.query(insertQuery, values);
  } catch (error) {
    throw error;
  }
}

async function seedGameScreenshots() {
  try {
    // Calling insertScreenshot for each game and each screenshot in the game_array
    for (let i = 0; i < game_data.length; i++) {
      for (let j = 0; j < game_data[i].sample_screenshots.length; j++) {
        await insertScreenshot(
          game_data[i],
          game_data[i].sample_screenshots[j]
        );
      }
    }
  } catch (error) {
    throw error;
  }
}

async function insertPlatform(platform) {
  try {
    // Insert query
    const insertQuery = `INSERT INTO platforms(platform_id, platform_name) 
      VALUES($1, $2)
      ON CONFLICT (platform_id) 
      DO NOTHING RETURNING *`;

    // Values
    const values = [platform.platform_id, platform.platform_name];

    // Running query
    console.log(`Inserting platform ${platform.platform_name}...`);
    const result = await client.query(insertQuery, values);
  } catch (error) {
    throw error;
  }
}

async function seedPlatformData() {
  try {
    // Calling insertPlatform for each game and platform object in game_data array
    for (let i = 0; i < game_data.length; i++) {
      for (let j = 0; j < game_data[i].platforms.length; j++) {
        await insertPlatform(game_data[i].platforms[j]);
      }
    }
  } catch (error) {
    throw error;
  }
}

async function seed() {
  try {
    await seedGameData();
    await seedPlatformData();
    await seedGamePlatforms();
    await seedGameScreenshots();
  } catch (error) {
    throw error;
  }
}

module.exports = seed;
