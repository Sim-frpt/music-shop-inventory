const { validationResult } = require('express-validator');

const categoryModel = require('../db/category');
const instrumentModel = require('../db/instrument');

const baseCategoryUrl = "/inventory/category";
const validateCategory = require('../services/category/validation');

// GET create form
exports.getCategoryCreateForm = (req, res) => {
  res.render("category-form", { title: "Create Category" });
};

// POST create form
exports.postCategoryCreateForm = [
  validateCategory(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      return res.render("category-form", {
        title: "Create Category",
        catInput: req.body.name,
        errors: errors.array()
      });
    }

    categoryModel.getCategory( "name", [ req.body.name ])
      .then(result => {
        if (result.rows.length > 0) {

          return res.render("category-form", {
            title: "Create Category",
            catInput: req.body.name,
            errors: [ { msg: "Another category by that name already exists" } ]
          });
        }

        categoryModel.createCategory([ req.body.name ])
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
  categoryModel.getCategory( "category_id", [ req.params.id ] )
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
  validateCategory(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      return res.render("category-form", {
        title: "Update Category",
        catInput: req.body.name,
        errors: errors.array()
      });
    }

    // Prevents updating the category with the same name as a category that
    // already exists, except if it's the category we're currently updating.
    categoryModel.getCategoryWithSameNameDifferentId( [
      req.body.name,
      req.params.id
    ])
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

        categoryModel.updateCategory([ req.body.name, req.params.id ])
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
  categoryModel.getCategory('category_id', [ req.body.category_id ])
    .then(result => {

      if (!result.rows.length) {
        const error = new Error("Category not found");
        error.status = 404;

        return next(error);
      }

      categoryModel.deleteCategory([ req.body.category_id ])
        .then(res.redirect('/inventory/categories'))
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

// GET category details
exports.getCategoryDetails = (req, res, next) => {
  Promise.all([
    categoryModel.getCategory('category_id', [ req.params.id ]),
    instrumentModel.getInstrumentByCategory([ req.params.id ])
  ])
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
  categoryModel.getCategoriesList()
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
