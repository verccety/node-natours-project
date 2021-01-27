const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) MIDDLEWARES
const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use((request, response, next) => {
  request.requestTime = new Date().toUTCString();
  next(); // next обязательный параметр для передачи управления по цепочке след. middleware
});

// 2) ROUTE HANDLERS

// 3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// 4) START SERVER
module.exports = app;
