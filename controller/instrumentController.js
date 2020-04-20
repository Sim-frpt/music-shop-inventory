const { validationResult } = require('express-validator');
const validateInstrument = require('../helpers/validators/instrument');
const db = require('../db/index');
const baseInstrumentUrl = '/inventory/instrument';

// GET base route
exports.getIndex = (req, res, next) => {
  const data = {};
  const categoryCount = db.query("SELECT COUNT(*) FROM category");
  const instrumentCount = db.query("SELECT COUNT(*) FROM instrument");

  data.title = "Instrument inventory homepage";

  Promise.all([categoryCount, instrumentCount])
    .then(results => {
      data.categoryCount = results[0].rows[0];
      data.instrumentCount = results[1].rows[0];

      res.render('index', data);
    })
    .catch(err => next(err))
};

// GET create form
exports.getInstrumentCreateForm = (req, res, next) => {
  const query = {
    text: "SELECT * from category"
  };

  db.query(query)
    .then( result => {
      res.render("instrument-form", {
        title: "Add instrument",
        categories: result.rows,
        baseInstrumentUrl
      });
    })
    .catch(err => next(err));
};

// POST create form
exports.postInstrumentCreateForm = [
  validateInstrument(),
  (req, res, next) => {
    const errors = validationResult(req);
    const { name, description, category, price, stock } = req.body;
    const categoryQuery = {
      text: "SELECT * FROM category"
    };

    if (!errors.isEmpty()) {
      db.query(categoryQuery)
        .then(result => {
          const categories = result.rows;

          return res.render("instrument-form", {
            title: "add instrument",
            categories,
            name,
            description,
            category,
            price,
            stock,
            baseInstrumentUrl,
            errors: errors.array({ onlyFirstError: true })
          });
        })
        .catch(err => next(err));
    } else {
      const insertInstrument = {
        text: "INSERT INTO instrument(name, description, category_id, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING instrument_id",
        values: [ name, description, category, price, stock ]
      };

      db.query(insertInstrument)
        .then(value => {
          return res.redirect(baseInstrumentUrl + '/' + value.rows[0].instrument_id);
        })
        .catch(err => next(err));
    }

  }

];

// GET update form
exports.getInstrumentUpdateForm = (req, res) => {
  res.send("Get update form, not implemented yet");
};

exports.postInstrumentUpdateForm = (req, res) => {
  res.send("Post update form, not implemented yet");
};

exports.getInstrumentDeleteForm = (req, res) => {
  res.send("get delete form, not implemented yet");
};

exports.postInstrumentDeleteForm = (req, res) => {
  res.send("post delete form, not implemented yet");
};

exports.getInstrumentDetails = (req, res, next) => {
  const query = {
    text: "SELECT instrument_id, i.name, description, price, stock, c.name as category, c.category_id FROM instrument i LEFT JOIN category c ON i.category_id = c.category_id WHERE instrument_id = $1",
    values: [ req.params.id ]
  };

  db.query(query)
    .then(result => {
      if (!result.rows) {
        const error = new Error("Instrument not found");
        error.status = 404;

        return next(error);
      }

      res.render("instrument-details", {
        title: "Instrument Details",
        instrument: result.rows[0],
        baseInstrumentUrl
      });
    })
    .catch(err => next(err));
};

exports.getInstrumentsList = (req, res, next) => {
  const query = {
    text: "SELECT instrument_id, i.name, description, price, c.name as category, c.category_id FROM instrument i LEFT JOIN category c ON i.category_id = c.category_id"
  };

  db.query(query)
    .then(result => {
      result.rows.forEach( row => row.description = shortenDescription(row.description));
      res.render("instruments", {
        title: "Instruments List",
        instruments: result.rows,
        baseInstrumentUrl
      });
    })
    .catch(err => next(err));
};

function shortenDescription(desc) {
  let desiredTextLength = 150;

  // Only shorten if character exists
  if (desc.charAt(desiredTextLength)) {

    // Make sure we don't cut in the middle of a word
    while(desc.charAt(desiredTextLength) !== ' ') {
      desiredTextLength++;
    }

    return desc.substring(0, desiredTextLength);
  }

  return desc;
}
