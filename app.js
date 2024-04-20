var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var session = require('express-session');
// const session = require('express-session'); 

var app = express();
var cors = require("cors");

// // Use CORS middleware
// const corsOptions = {
//   origin: "http://127.0.0.1:5500/",
//   optionsSuccessStatus: 200,
// };

app.use(cors());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000, // thời gian hết hạn của session, ở đây là 1 ngày
  }
}))

app.use(function(req, res, next) {
  res.locals.session = req.session;
  console.log(res.locals.session);
  next();
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect("mongodb://127.0.0.1:27017/TestC5")
  .then(function () {
    console.log("connected");
  })
  .catch(function (err) {
    console.log(err);
  });

app.use("/", require("./routes/index"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    success: false,
    data: err.message,
  });
});

// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });

module.exports = app;
