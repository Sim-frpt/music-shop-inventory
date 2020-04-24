const db = require('../db/index');

exports.getCategoryCount = () => {
  return db.query("SELECT COUNT(*) FROM category"); 
};

exports.getAllCategories = () => {
  return db.query("SELECT * FROM category");
};
