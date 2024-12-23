const db = require("../db/db-pool");
const { DatabaseError } = require("../errorTypes");
const cart = require("../models/cartModels");

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

    const user = await getUser(email);

    const createdUserCart = cart.addCart(user.user_id);
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

async function insertRefreshToken(userId, tokenHash, expiresAt) {
  try {
    const result = await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [userId, tokenHash, expiresAt]
    );
    if (result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  } catch (err) {
    console.log(err);
    throw new DatabaseError(
      `Database Error while inserting refresh token: ${err.message}`
    );
  }
}

async function deleteRefreshToken(tokenHash) {
  try {
    const result = await db.query(
      `DELETE FROM refresh_tokens WHERE token_hash=$1 RETURNING *`,
      [tokenHash]
    );

    if (result.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    throw new DatabaseError(
      `Database Error while deleting refresh token: ${err.message}`
    );
  }
}

async function getRefreshTokens(userId) {
  try {
    const refreshTokens = await db.query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()`,
      [userId]
    );

    if (refreshTokens.length > 0) {
      return refreshTokens;
    } else {
      return undefined;
    }
  } catch (err) {
    console.log(err);
    throw new DatabaseError(
      `Database Error while deleting refresh token: ${err.message}`
    );
  }
}

module.exports = {
  getUser,
  createUser,
  insertRefreshToken,
  deleteRefreshToken,
  getRefreshTokens,
};
