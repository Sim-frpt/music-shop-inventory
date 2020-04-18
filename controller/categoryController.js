const { check, validationResult } = require('express-validator');
const db = require('../db/index');
const baseCategoryUrl = "/inventory/category";

// GET create form
exports.getCategoryCreateForm = (req, res) => {
  res.render("category-form", { title: "Add Category" });
};

// POST create form
exports.postCategoryCreateForm = [
  check('name')
    .isLength({ min:2, max: 50}).withMessage("Name must be between 2 and 50 characters")
    .not().isEmpty().withMessage("Name must not be empty")
    .trim()
    .isAlpha().withMessage("Name must not contain numbers")
    .escape()
    .customSanitizer(value => value.toLowerCase())
  ,
  (req, res, next) => {
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
      values: [ req.body.name ]
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
  }
];

// GET update form
exports.getCategoryUpdateForm = (req, res, next) => {
  const query = {
    text: "SELECT * FROM category WHERE category_id = $1",
    values: [ req.params.id ]
  };

  db.query(query)
    .then(result => {
      if (!result.rows.length) {
        const error = new Error("Category not found");
        error.status = 404;

        return next(err);
      }

      res.render("category-form", {
        title: "Update Category",
        catInput: result.rows[0].name
      });
    })
    .catch(err => next(err));
};

// POST update form
exports.postCategoryUpdateForm = [
  check('name')
    .isLength({ min:2, max: 50}).withMessage("Name must be between 2 and 50 characters")
    .not().isEmpty().withMessage("Name must not be empty")
    .trim()
    .isAlpha().withMessage("Name must not contain numbers")
    .escape()
    .customSanitizer(value => value.toLowerCase())
  ,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      return res.render("category-form", {
        title: "Update Category",
        catInput: req.body.name,
        errors: errors.array()
      });
    }

    const verifyNameQuery = {
      text: "SELECT * FROM category WHERE name = $1 AND category_id != $2",
      values: [ req.body.name, req.params.id ]
    }

    const updateNameQuery = {
      text: "UPDATE category SET name = $1 WHERE category_id = $2 RETURNING category_id",
      values: [ req.body.name, req.params.id ]
    };

    db.query(verifyNameQuery)
      .then(result => {

        if (result.rows.length) {
          const error = {
            msg: "Another category already has that name"
          }

          return res.render("category-form", {
            title: "Update Category",
            catInput: req.body.name,
            errors: [ error ]
          });
        }

        db.query(updateNameQuery)
          .then(result => {
            return res.redirect(baseCategoryUrl + "/" + result.rows[0].category_id);
          })
          .catch(err => next(err));
      })
      .catch(err => next(err));
  }
];

// POST delete form
exports.postCategoryDeleteForm = (req, res, next) => {
  const searchCatQuery = {
    text: "SELECT * FROM category WHERE category_id = $1",
    values: [ req.body.category_id ]
  }

  const deleteCatQuery = {
    text: "DELETE FROM category WHERE category_id = $1",
    values: [ req.body.category_id ]
  };

  db.query(searchCatQuery)
    .then(result => {

      if (!result.rows.length) {
        return res.redirect('/inventory/categories');
      }

      db.query(deleteCatQuery)
        .then(res.redirect('/inventory/categories'))
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

// GET category details
exports.getCategoryDetails = (req, res, next) => {
  const categoryQuery = {
    text: "SELECT * from category WHERE category_id = $1",
    values: [ req.params.id ]
  };

  const instrumentsQuery = {
    text: "SELECT instrument_id, name FROM instrument WHERE category_id = $1 ORDER BY name ASC",
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
        instruments,
        firstTwoInstruments: instruments.slice(0, 2),
        baseCategoryUrl
      });
    })
    .catch(err => next(err));
};

// GET categories list
exports.getCategoriesList = (req, res, next) => {
  db.query("SELECT * FROM category ORDER BY name ASC")
    .then(result => {
      res.render('categories', {
        title: "Categories List",
        categories: result.rows,
        baseCategoryUrl
      });
    })
    .catch(err => {
      next(err);
    });
};
