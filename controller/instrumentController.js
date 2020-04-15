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

      console.log(data);
      res.render('index', data);
    })
    .catch(err => next(err))
    //.then(db.client.end());
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

exports.getInstrumentDetails = (req, res) => {
  res.send("Get details, not implemented yet");
};

exports.getInstrumentsList = (req, res) => {
  res.send("Get instruments list, not implemented yet");
};
