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

app.all('*', (request, response, next) => {
  // response.status(404).json({status: 'fail', message: `Can't find
  //   ${request.originalUrl} on this server!`,
  // });

  const error = new Error(`Can't find ${request.originalUrl} on this server!`);
  error.status = 'fail';
  error.statusCode = 404;
  next(error); // If the (next) function receives  an argument,
  //Express will automatically know that there was an error; applies to
  //every next function in every single middleware anywhere
});

app.use((error, request, response, next) => {
  // By specifying four parameters, Express automatically knows that entire function is an error handling middleware
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

// 4) START SERVER
module.exports = app;
