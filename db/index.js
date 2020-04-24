const { Pool } = require('pg');
const debug = require('debug')("music-shop-inventory:Node-Postgres");

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

const pool = new Pool(config);

pool
  .connect()
  .then(() => debug(`Connected to ${config.database} db`))
  .catch(err => debug("connection error", err.stack));

module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  }
};
