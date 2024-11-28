const db = require("../db-pool");

async function getUser(email) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

async function createUser({ firstName, lastName, email, hash }) {
  try {
    const result = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstName, lastName, email, hash]
    );

    if (result.length > 0) {
      return result;
    } else {
      return undefined;
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

module.exports = { getUser, createUser };
