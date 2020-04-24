const db = require('../db/index');

exports.getInstrumentCount = () => {
  return db.query("SELECT COUNT(*) FROM instrument");
};

exports.getInstrument = id => {
  const query = {
    text: "SELECT * from instrument WHERE instrument_id = $1",
    values: id
  };

  return db.query(query);
};

exports.getInstrumentByCategory = id => {
  const query = {
    text: "SELECT instrument_id, name FROM instrument WHERE category_id = $1 ORDER BY name ASC",
    values: id
  };

  return db.query(query);
};

exports.getInstrumentDetails = id => {
  const query = {
    text: "SELECT instrument_id, i.name, description, price, stock, picture, c.name as category, c.category_id FROM instrument i LEFT JOIN category c ON i.category_id = c.category_id WHERE instrument_id = $1",
    values: id
  }

  return db.query(query);
};

exports.getInstrumentList = () => {
  const query = {
    text: "SELECT instrument_id, i.name, description, price, c.name as category, c.category_id FROM instrument i LEFT JOIN category c ON i.category_id = c.category_id"
  }

  return db.query(query);
}

exports.createInstrument = values => {
  const query = {
    text: "INSERT INTO instrument(name, description, category_id, price, stock, picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING instrument_id",
    values
  };

  return db.query(query);
};

exports.updateInstrument = values => {
  const query = {
    text: "UPDATE instrument SET name = $1, description = $2, category_id = $3, price = $4, stock = $5, picture = $6 WHERE instrument_id = $7 RETURNING instrument_id",
    values
  }

  return db.query(query);
};

exports.deleteInstrument = id => {
  const query = {
    text: "DELETE FROM instrument WHERE instrument_id = $1",
    values: id
  };

  return db.query(query);
}

