const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  query: async function (queryText, queryValues) {
    const { rows } = await pool.query(queryText, queryValues);
    return rows;
  },
};
