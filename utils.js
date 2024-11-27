const db = require("./db/db-pool");

async function findUser(email) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.length > 0) {
      console.log("User found");
    } else {
      console.log("User does not exist");
    }
  } catch (error) {
    throw new Error(`Error: ${error}`);
  }
}

module.exports = findUser;
