const db = require('../db/index');

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

exports.getInstrumentCreateForm = (req, res) => {
  res.send("Get create form, not implemented yet");
};

exports.postInstrumentCreateForm = (req, res) => {
  res.send("Post create form , not implemented yet");
};

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
        instrument: result.rows[0]
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
        instruments: result.rows
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
