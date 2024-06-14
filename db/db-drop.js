const client = require("./db-client");

async function getTables() {
  try {
    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname= 'public'`
    );

    const tableNames = [];
    for (const table of rows) {
      tableNames.push(table.tablename);
    }
    return tableNames;
  } catch (error) {
    throw error;
  }
}

async function dropTables() {
  try {
    await client.connect();
    // Begin transaction
    await client.query("BEGIN");

    // Execute each query
    const tables = await getTables();
    if (tables.length === 0) {
      console.log("No tables to drop");
      return;
    }
    for (const table of tables) {
      console.log(`Dropping table ${table}`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    // Commit the transaction
    await client.query("COMMIT");
  } catch (error) {
    console.error(error);
    await client.query("ROLLBACK");
  } finally {
    console.log("done.");
    await client.end();
  }
}

dropTables();
