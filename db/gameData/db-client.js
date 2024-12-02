const { Client } = require("pg");
const config = require("../../config");

const client = new Client({ connectionString: config.databaseURL });

module.exports = client;
