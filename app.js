const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const hbs = require('hbs');
const hbsUtils = require('hbs-utils')(hbs);

global.appRoot = path.resolve(__dirname);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const inventoryRouter = require('./routes/inventory');

require("./db/index");
require("./helpers/handlebars/hbs");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layout/base'});
app.set('view engine', 'hbs');

// Register hbs partials
hbsUtils.registerWatchedPartials(path.join(__dirname, '/views/partials'));

app.use(helmet());
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/inventory', inventoryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
