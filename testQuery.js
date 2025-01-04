const client = require("./db/gameData/db-client");

(async () => {
  try {
    // Connect to the database
    await client.connect();
    console.log("Connected to the database.");

    // Example: Select all rows from a table
    const { rows } = await client.query(
      "SELECT stripe_id FROM users WHERE user_id = 1"
    );
    console.log(rows[0].stripe_id);
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    // Disconnect from the database
    await client.end();
    console.log("Disconnected from the database.");
  }
})();
