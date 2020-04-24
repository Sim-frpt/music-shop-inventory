const { check } = require('express-validator');

function validateCategory() {
  return check('name')
    .isLength({ min:2, max: 50}).withMessage("Name must be between 2 and 50 characters")
    .not().isEmpty().withMessage("Name must not be empty")
    .trim()
    .isAlpha().withMessage("Name must not contain numbers")
    .escape()
    .customSanitizer(value => value.toLowerCase());
}

module.exports = validateCategory;
