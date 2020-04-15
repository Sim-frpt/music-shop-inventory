const { Pool } = require('pg');

//const connectionString = "postgresql://sim:simon@localhost:5432/music_shop_inventory";

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

//const pool = new pool(connectionString);
const pool = new Pool(config);

pool
  .connect()
  .then(() => console.log(`Connected to ${config.database} db`))
  .catch(err => console.error("connection error", err.stack));

module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  }
};
