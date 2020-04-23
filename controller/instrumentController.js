const multer = require('multer');
const fs = require('fs');
const { validationResult } = require('express-validator');
const multerConfig = require('../helpers/multer/config');
const validateInstrument = require('../helpers/validators/instrument')
const db = require('../db/index');
const shortenDescription = require('../helpers/helpers');

const baseInstrumentUrl = '/inventory/instrument';
const placeholderPicture = "placeholder-instruments.jpg";
const pictureUpload = multer(multerConfig).single('picture');
const uploadFolder = "/uploads/";

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

    if ( req.fileValidationError ) {
      // Weird naming, but it works to put multer errors in the same array as express-validator errors
      errors.errors.push({ msg: req.fileValidationError });
    }

    // If errors, rerender the form with all the entered info + errors
    if (!errors.isEmpty()) {
      // if file was uploaded => delete it
      if (picture) {
        fs.unlink(picture.path, err => {
          if (err) {
            next(err);
          }
        });
      }

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
      //for DB insertion
      const pictureName = picture ? picture.filename : null;
      const insertInstrument = {
        text: "INSERT INTO instrument(name, description, category_id, price, stock, picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING instrument_id",
        values: [ name, description, category_id, price, stock, pictureName ]
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

      // If there was no picture in DB, make the picture be the placeholder one
      let isPlaceholderPic = false;
      if (!instrument[0].picture) {
        instrument[0].picture = placeholderPicture
        isPlaceholderPic = !isPlaceholderPic;
      };

      res.render("instrument-form", {
        title: "Update Instrument",
        instrument: instrument[0],
        categories,
        baseInstrumentUrl,
        uploadFolder,
        isPlaceholderPic
      });
    })
    .catch(err => next(err));
};

// POST update form
exports.postInstrumentUpdateForm = [
  (req, res, next) => {
    // IMPORTANT :Multer throws an error if you enter a wrong file type.
    // That means that the input type='file' must be the last input in the form,
    // cause every following input will be voided by the error, 
    // making it impossible to re-render them in the update form in 
    // the error handling logic below.
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

    if ( req.fileValidationError ) {
      // Weird naming, but it works to put multer errors in the same array as express-validator errors
      errors.errors.push({ msg: req.fileValidationError });
    }

    if (!errors.isEmpty()) {
      // if file was uploaded => delete it
      if (picture) {
        fs.unlink(picture.path, err => {
          if (err) {
            next(err);
          }
        });
      }

      return db.query(categoryQuery)
        .then(result => {
          const categories = result.rows;

          // If there was an error and no file was uploaded, return picture to be the last that was successfully associated with the instrument
          req.body.picture = req.body.last_successfully_saved_pic;

          return res.render("instrument-form", {
            title: "Update instrument",
            instrument: req.body,
            baseInstrumentUrl,
            categories,
            uploadFolder,
            errors: errors.array({ onlyFirstError: true })
          });
        })
        .catch(err => next(err));
    }

    //for DB insertion => If a new picture has been successfully validated, delete the old picture, but only if it's not the placeholder picture.
    if (picture && req.body.last_successfully_saved_pic !== placeholderPicture) {
        fs.unlink(
          global.appRoot + '/public/uploads/' + req.body.last_successfully_saved_pic,
          err => {
          if (err) {
            next(err);
          }
        });
    }

    const pictureName = picture ? picture.filename :
      req.body.last_successfully_saved_pic;
    const insertQuery = {
      text: "UPDATE instrument SET name = $1, description = $2, category_id = $3, price = $4, stock = $5, picture = $6 WHERE instrument_id = $7 RETURNING instrument_id",
      values: [ name, description, category_id, price, stock, pictureName, req.params.id ]
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

      // Delete the insturment image from public/upload before deleting the
      // record from the DB, but only if it's not the placeholder picture.
      if (result.rows[0].picture !== placeholderPicture) {
        fs.unlink(
          global.appRoot + '/public/uploads/' + result.rows[0].picture,
          err => {
          if (err) {
            next(err);
          }
        });
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
    text: "SELECT instrument_id, i.name, description, price, stock, picture, c.name as category, c.category_id FROM instrument i LEFT JOIN category c ON i.category_id = c.category_id WHERE instrument_id = $1",
    values: [ req.params.id ]
  };

  db.query(query)
    .then(result => {
      if (!result.rows) {
        const error = new Error("Instrument not found");
        error.status = 404;

        return next(error);
      }

      const instrument = result.rows[0];

      if (!instrument.picture) {
        instrument.picture = placeholderPicture
      }

      res.render("instrument-details", {
        title: "Instrument Details",
        instrument: result.rows[0],
        baseInstrumentUrl,
        uploadFolder
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

