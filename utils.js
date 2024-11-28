const db = require("./db/db-pool");

async function findUser(email) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

module.exports = findUser;
