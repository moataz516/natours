const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utilities/appError');
const globalErrHandler = require('./controllers/errorController.');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1) MIDDLEWARES
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// Set security http headers
// app.use(
//   helmet.contentSecurityPolicy({
//     //useDefaults: false,

//     directives: {
//       defaultSrc: ["'self'"],
//       connectSrc: [
//         "'self'",
//         'http://localhost:8000',
//         'ws://localhost:51420',
//         'ws://localhost:51282/'
//       ],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'data:'],
//       formAction: ["'self'"],
//       frameAncestors: ["'self'"],
//       imgSrc: ["'self'", 'data:'],
//       objectSrc: ["'none'"],
//       scriptSrc: [
//         "'self'",
//         'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.2/axios.js'
//       ],
//       scriptSrcAttr: ["'none'"],
//       styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//       upgradeInsecureRequests: []
//     }
//   })
// );

if (process.env.NODE_ENV !== 'development') {
  app.use(
    helmet.contentSecurityPolicy({
      //useDefaults: false,

      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          'http://localhost:8000',
          'ws://localhost:51420',
          'ws://localhost:51282/',
          'https://js.stripe.com/v3/',
          'https://r.stripe.com/b'
        ],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: [
          "'self'",
          'https://cdnjs.cloudflare.com/ajax/libs/axios/1.7.2/axios.js'
        ],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        upgradeInsecureRequests: []
      }
    })
  );
}

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanatize()); // filter all $ and .

// Data sanitization againt XSS
app.use(xss()); // clean any user input from malicious HTML code

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duraion', 'difficulty', 'price']
  })
);
app.use(cors());

// Serving static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can not find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can not find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrHandler);

module.exports = app;
