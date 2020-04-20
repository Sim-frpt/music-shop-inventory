const { check } = require('express-validator');

function validateInstrument() {
  return [
    check('name')
    .isLength({ min:2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
    .not().isEmpty().withMessage("Name must not be empty")
    .trim()
    .escape(),
    check('description')
    .isLength({ max: 2000 }).withMessage("Description must be shorter than 2000 characters")
    .trim()
    .escape(),
    check('category')
    .not().isEmpty().withMessage("Select a category for the instrument")
    .isInt({ allow_leading_zeroes: false })
    .trim()
    .escape(),
    check('price')
    .isNumeric()
    .not().isEmpty().withMessage("Price must not be empty")
    .trim()
    .escape(),
    check('stock')
    .isInt()
    .not().isEmpty()
    .trim()
    .escape()
  ];
}

module.exports = validateInstrument;
