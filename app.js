const path = require('path');
const express = require('express');
const logger = require('morgan');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const appError = require('./controllers/error.controller');
const globalErrorHandler = require('./middleware/error.middleware');

const userRoutes = require('./routes/user.routes');
const { checkPayment } = require('./controllers/user.controller')

const app = express();

app.enable("trust proxy");

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.options('*', cors());

app.use(helmet());

app.use(xss());

app.use(hpp());

app.use(compression());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

if (process.env.NODE_ENV != 'production') {
    app.use(logger('dev'));
}

require('./middleware/passport.middleware')(passport);

app.get('/users/account/payment_success', (req, res, next) => {
    res.status(200).render('payment_success', {message: 'Account successfully funded'});
});

app.use('/webhook/payment', checkPayment);

app.use('/api/v1/users', userRoutes);


app.all('*', (req, res, next) => {
	next(new appError(`Requested resource not available`, 404));
})

app.use(globalErrorHandler);

module.exports = app;
