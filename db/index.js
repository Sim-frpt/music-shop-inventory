const { Client } = require('pg');

//const connectionString = "postgresql://sim:simon@localhost:5432/music_shop_inventory";

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

//const client = new Client(connectionString);
const client = new Client(config);

client
  .connect()
  .then(() => console.log(`Connected to ${config.database} db`))
  .catch(err => console.error("connection error", err.stack));

module.exports = {
  query: (text, params) => {
    return client.query(text, params);
  }
};
