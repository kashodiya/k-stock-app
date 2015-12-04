var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var errorhandler = require('errorhandler')

var routes = require('./routes/index');
var api = require('./routes/api');
var session = require('express-session');

var app = express();

var dbUrl = 'mongodb://localhost:27017/k-vote-app';

// Connect to database
mongoose.connect(dbUrl);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
  }
);

var MongoStore = require('connect-mongo')(session);
app.use(session({
  secret: 'foo fcc k',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

//app.set('view engine', 'jade');
//app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorhandler());

// Make our db accessible to our router
//app.use(function(req,res,next){
//  req.db = db;
//  next();
//});

require('./passport-util')(app);

var changeTrack = {
  lastChangeTime: new Date(),
  test: 0
}

var injectChange = function (req, resp, next) {
  req.changeTrack = changeTrack;
  next();
}

app.use('/', routes);
app.use('/api', injectChange, api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
