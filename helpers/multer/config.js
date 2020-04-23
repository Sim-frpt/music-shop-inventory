const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, global.appRoot + '/public/uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb) {
  const fileTypes = /jpe?g|png|gif/;
  const isCorrectExtension = fileTypes.test(path.extname(file.originalname));
  const isCorrectMimeType = fileTypes.test(file.mimetype);

  if (isCorrectMimeType && isCorrectExtension) {
    cb(null, true);
  } else {
    cb(new Error("file must be an image type"));
  }
}

const multerConfig = {
  storage,
  limits: {
    files: 1,
    fileSize: 1024 * 1024
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
};

module.exports = multerConfig;
