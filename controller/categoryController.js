const db = require('../db/index');
const { check, validationResult } = require('express-validator');
const baseCategoryUrl = "/inventory/category";

exports.getCategoryCreateForm = (req, res) => {
  res.render("category-form", { title: "Create Category" });
};

exports.postCategoryCreateForm = [
  check('name')
    .isLength({ min:2, max: 50}).withMessage("Name must be between 2 and 50 characters")
    .not().isEmpty().withMessage("Name must not be empty")
    .trim()
    .isAlpha().withMessage("Name must not contain numbers")
    .escape()
, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.render("category-form", {
      title: "Create Category",
      catInput: req.body.name,
      errors: errors.array()
    });
  }

  const existingCatQuery = {
    text: "SELECT category_id FROM category WHERE name = $1",
    values: [ req.body.name ]
  };

  const createCatQuery = {
    text: "INSERT INTO category(name) VALUES($1) RETURNING category_id",
    values: [ req.body.name.toLowerCase() ]
  };

  db.query(existingCatQuery)
    .then(result => {
      if (result.rows.length > 0) {
        return res.redirect(baseCategoryUrl + "/" + result.rows[0].category_id);
      }

      db.query(createCatQuery)
        .then(result => {
          return res.redirect(baseCategoryUrl + "/" + result.rows[0].category_id);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}];

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
  const categoryQuery = {
    text: "SELECT * from category WHERE category_id = $1",
    values: [ req.params.id ]
  };

  const instrumentsQuery = {
    text: "SELECT instrument_id, name FROM instrument WHERE category_id = $1",
    values: [ req.params. id ]
  };

  Promise.all([ db.query(categoryQuery), db.query(instrumentsQuery) ])
    .then(results => {
      const category = results[0].rows[0];
      const instruments = results[1].rows;

      if (!category) {
        const error = new Error("Category not found");
        error.status = 404;

        return next(error);
      }

      res.render("category-details", {
        title: "Category Details",
        category,
        instruments
      });
    })
    .catch(err => next(err));
};

exports.getCategoriesList = (req, res, next) => {
  db.query("SELECT * FROM category ORDER BY name ASC")
    .then(result => {
      res.render('categories', {
        title: "Categories List",
        categories: result.rows,
        url: "/inventory/category",

      });
    })
    .catch(err => {
      next(err);
    });
};
