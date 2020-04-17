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

exports.getCategoryDetails = (req, res, next) => {
  const query = {
    text: "SELECT i.name as instrument, instrument_id, c.name FROM category c LEFT JOIN instrument i ON c.category_id = i.category_id WHERE c.category_id = $1",
    values: [req.params.id]
  };

  db.query(query)
    .then(result => {
      if (!result.rows) {
        const error = new Error("Category not found");
        error.status = 404;

        next(error);
      }
      console.log(result.rows);
      res.render("category-details", {
        title: "Category Details",
        categoryName: result.rows[0].name,
        instruments: result.rows
      });
    })
    .catch(err => next(err));
};

exports.getCategoriesList = (req, res, next) => {
  db.query("SELECT * FROM category ORDER BY name ASC")
    .then(result => {
      res.render('categories', {
        title: "Categories List",
        categories: result.rows
      });
    })
    .catch(err => {
      next(err);
    });
};
