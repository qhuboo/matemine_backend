const client = require("./db/gameData/db-client");

(async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database.");

    // Example: Select all rows from a table
    const { rows } = await client.query(
      "SELECT game_id, quantity FROM cart_items WHERE cart_id = 1"
    );
    console.log(rows);
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log("Disconnected from the database.");
  }
})();
