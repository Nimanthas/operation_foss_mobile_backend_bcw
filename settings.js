// This will load our .env file and add the values to process.env,
// IMPORTANT: Omit this line if you don't want to use this functionality
require("dotenv").config({ silent: true });

module.exports = {
  port: process.env.PORT || 8701, //prod port
  env: process.env.NODE_ENV || "production",
  pg_user: process.env.DB_USER || "postgres",
  pg_pw: process.env.DB_PASSWORD || "P@ssw0rd",
  pg_host: process.env.DB_HOST || "localhost",
  pg_port: process.env.DB_PORT || "5432",
  pg_db: process.env.DB_DATABASE || "labdip_chart",
  token_refresh_timeout: process.env.TOKEN_REFRESH_TIMEOUT || '3d',
  token_access_timeout: process.env.TOKEN_ACCESS_TIMEOUT || '1m',
  token_issuer: process.env.TOKEN_ISSUER || 'brandix-digital-labdipchart-automation'
};