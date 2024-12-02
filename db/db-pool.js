const { Pool } = require("pg");
const config = require("../config");

const pool = new Pool({ connectionString: config.databaseURL });

module.exports = {
  query: async function (queryText, queryValues) {
    const { rows } = await pool.query(queryText, queryValues);
    return rows;
  },
};
