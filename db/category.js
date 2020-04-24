const db = require('../db/index');

exports.getCategoryCount = () => {
  return db.query("SELECT COUNT(*) FROM category");
};

exports.getAllCategories = () => {
  return db.query("SELECT * FROM category");
};

exports.getCategory = (field, values) => {
  const query = {
    text: `SELECT * FROM category WHERE ${field} = $1`,
    values
  }

  return db.query(query);
};

exports.getCategoryWithSameNameDifferentId = values => {
  const query = {
      text: "SELECT * FROM category WHERE name = $1 AND category_id != $2",
      values
  };

  return db.query(query);
}

exports.getCategoriesList = () => {
  return db.query("SELECT * FROM category ORDER BY name ASC");
}

exports.createCategory = values => {
  const query = {
    text: "INSERT INTO category(name) VALUES($1) RETURNING category_id",
    values
  };

  return db.query(query);
};

exports.updateCategory = values => {
  const query = {
    text: "UPDATE category SET name = $1 WHERE category_id = $2 RETURNING category_id",
    values
  };

  return db.query(query);
};

exports.deleteCategory = id => {
  const query = {
    text: "DELETE FROM category WHERE category_id = $1",
    values: id
  };

  return db.query(query);
};
