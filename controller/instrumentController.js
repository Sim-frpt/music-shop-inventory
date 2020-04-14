exports.getIndex = (req, res) => {
  res.render('index', {body: 'test'});
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
