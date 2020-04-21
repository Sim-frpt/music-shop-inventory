const multer = require('multer');
const path = require('path');
const { validationResult } = require('express-validator');
const multerConfig = require(path.resolve(__dirname, '../helpers/multer/config'));
const validateInstrument = require(
  path.resolve(__dirname, '../helpers/validators/instrument')
);
const db = require(path.resolve(__dirname, '../db/index'));
const shortenDescription = require(path.resolve(__dirname, '../helpers/helpers'));
const baseInstrumentUrl = '/inventory/instrument';

const pictureUpload = multer(multerConfig).single('picture');

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
  (req, res, next) => {
    pictureUpload(req, res, err => {
      if (err) {
        req.fileValidationError = err.message;
      }
      next();
    })
  },
  validateInstrument(),
  (req, res, next) => {
    const errors = validationResult(req);
    const { name, description, category_id, price, stock } = req.body;
    const categoryQuery = {
      text: "SELECT * FROM category"
    };
    const picture = req.file;
    // TODO finish multer stuff
    //if (req.file) {
      //picture = req.file.filename;
    //} else {
      //picture = null;
    //}

    if ( req.fileValidationError ) {
      // Weird naming, but it works to put multer errors in the same array as express-validator errors
      errors.errors.push({ msg: req.fileValidationError });
    }

    if (!errors.isEmpty()) {
      db.query(categoryQuery)
        .then(result => {
          const categories = result.rows;

          return res.render("instrument-form", {
            title: "Add instrument",
            instrument: req.body,
            baseInstrumentUrl,
            categories,
            errors: errors.array({ onlyFirstError: true })
          });
        })
        .catch(err => next(err));
    } else {
      console.log(picture);
      const insertInstrument = {
        text: "INSERT INTO instrument(name, description, category_id, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING instrument_id",
        values: [ name, description, category_id, price, stock]
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
exports.getInstrumentUpdateForm = (req, res, next) => {
  const categoriesQuery = {
    text: "SELECT * from category"
  };

  const instrumentQuery = {
    text: "SELECT * from instrument WHERE instrument_id = $1",
    values: [ req.params.id ]
  };

  Promise.all([ db.query(categoriesQuery), db.query(instrumentQuery) ])
    .then(results => {
      const categories = results[0].rows;
      const instrument = results[1].rows;

      if (!instrument.length) {
        const error = new Error("Instrument not found");
        error.status = 404;

        return next(error);
      }

      res.render("instrument-form", {
        title: "Update Instrument",
        instrument: instrument[0],
        categories,
        baseInstrumentUrl
      });
    })
    .catch(err => next(err));
};

// POST update form
exports.postInstrumentUpdateForm = [
  validateInstrument(),
  (req, res, next) => {

    const errors = validationResult(req);
    const { name, description, category_id, price, stock } = req.body;
    const categoryQuery = {
      text: "SELECT * FROM category"
    };

    if (!errors.isEmpty()) {
      return db.query(categoryQuery)
        .then(result => {
          const categories = result.rows;

          return res.render("instrument-form", {
            title: "Update instrument",
            instrument: req.body,
            baseInstrumentUrl,
            categories,
            errors: errors.array({ onlyFirstError: true })
          });
        })
        .catch(err => next(err));
    }

    const insertQuery = {
      text: "UPDATE instrument SET name = $1, description = $2, category_id = $3, price = $4, stock = $5 WHERE instrument_id = $6 RETURNING instrument_id",
      values: [ name, description, category_id, price, stock, req.params.id ]
    };

    db.query(insertQuery)
      .then(result => {
        res.redirect(`${baseInstrumentUrl}/${result.rows[0].instrument_id}`);
      })
      .catch(err => next(err));
  }
];

// POST instrument delete
exports.postInstrumentDeleteForm = (req, res, next) => {
  const findInstQuery = {
    text: "SELECT * FROM instrument WHERE instrument_id = $1",
    values: [ req.body.instrument_id ]
  }

  const deleteInstQuery = {
    text: "DELETE FROM instrument WHERE instrument_id = $1",
    values: [ req.body.instrument_id ]
  }

  db.query(findInstQuery)
    .then(result => {

      if (!result.rows.length) {
        const error = new Error("Instrument not found");
        error.status = 404;

        return next(error);
      }

      db.query(deleteInstQuery)
        .then(res.redirect("/inventory/instruments"))
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

// GET instrument details
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

// GET instrument list
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

