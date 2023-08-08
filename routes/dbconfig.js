require('dotenv').config();
const settings = require("../settings");
const { Pool } = require('pg');

const connectionString = `postgresql://${settings?.pg_user}:${settings?.pg_pw}@${settings?.pg_host}:${settings?.pg_port}/${settings?.pg_db}`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: false
});

module.exports = { pool }