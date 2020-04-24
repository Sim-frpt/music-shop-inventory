DROP TABLE IF EXISTS instrument CASCADE;
DROP TABLE IF EXISTS category CASCADE;

CREATE TABLE category (
  category_id serial PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE instrument(
  instrument_id serial PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  stock INTEGER,
  picture VARCHAR(200),
  category_id INTEGER REFERENCES category(category_id) NOT NULL
);

