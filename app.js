/**
 * Created by User on 13.06.2017.
 */
const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const httpError = require('http-errors');
const passport = require('passport');

const sessionRouter = require('./routes/session');
const bookRouter = require('./routes/book');

require('./passport/passportConfig')(passport);

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json'}));

app.use(passport.initialize());
// only apply to requests that begin with /api/

app.use('/session', sessionRouter);
app.use('/book', bookRouter);

//404 handler
app.use((req, res, next) => {
    let err = httpError(404, 'Not Found');
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
//res.status(err.status);
    console.log(err.toString());
    res.send(err.toString());
});

module.exports = app;