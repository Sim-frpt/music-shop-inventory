const db = require('../db/index');

exports.getCategoryCreateForm = (req, res) => {
  res.send("Get create form, not implemented yet");
};

exports.postCategoryCreateForm = (req, res) => {
  res.send("Post create form , not implemented yet");
};

exports.getCategoryUpdateForm = (req, res) => {
  res.send("Get update form, not implemented yet");
};

exports.postCategoryUpdateForm = (req, res) => {
  res.send("Post update form, not implemented yet");
};

exports.getCategoryDeleteForm = (req, res) => {
  res.send("get delete form, not implemented yet");
};

exports.postCategoryDeleteForm = (req, res) => {
  res.send("post delete form, not implemented yet");
};

exports.getCategoryDetails = (req, res) => {
  res.send("Get details, not implemented yet");
};

exports.getCategoriesList = (req, res) => {
  db.query("SELECT * FROM category ORDER BY name ASC")
    .then( result => {
      res.render('categories', {
        title: "Categories List",
        categories: result.rows
      });
    })
    .catch(err => {
      next(err);
    });
};
