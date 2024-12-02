const db = require("../db/db-pool");
const { DatabaseError } = require("../errorTypes");

async function getUser(email) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (err) {
    console.log(err.code);
    throw new DatabaseError(
      `Database Error while fetching user: ${err.message}`
    );
  }
}

async function createUser({ firstName, lastName, email, hash }) {
  try {
    const result = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstName, lastName, email, hash]
    );
    if (result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (err) {
    console.log(err.code);
    if (err.code === 23505) {
      throw new DatabaseError(
        `Database Error while creating user: ${err.message}`
      );
    }
    throw new DatabaseError(
      `Database Error while creating user: ${err.message}`
    );
  }
}

module.exports = { getUser, createUser };
