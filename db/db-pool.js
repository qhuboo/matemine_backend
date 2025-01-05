const { Pool } = require("pg");
const config = require("../config");

const pool = new Pool({ connectionString: config.databaseURL });

module.exports = {
  query: async function (queryText, queryValues) {
    const { rows } = await pool.query(queryText, queryValues);
    return rows;
  },
  transaction: async function (callback) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await callback(client);

      await client.query("COMMIT");

      return result;
    } catch (error) {
      await client.query(`ROLLBACK`);
      throw error;
    } finally {
      client.release();
    }
  },
};
