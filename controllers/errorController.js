/* eslint-disable no-console */
import AppError from '../utils/appError.js';

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field name value:  ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDevelopment = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

const sendErrorProduction = (error, response) => {
  // Operational, trusted error: send message to the client
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
    // Programming or other unknown error: don't send error details
  } else {
    //1) Log error
    console.error('ERROR', error);

    //2) Send generic message
    response.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export default (error, request, response, next) => {
  // By specifying four parameters, Express automatically knows that entire function is an error handling middleware
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    //spread operator will not copy the the source object’s prototype to the
    //target object, using (assign) instead. Spread operator is just a sugar for
    //Object.assign with the first parameter set to empty object

    let errorCopy = Object.assign(error);
    if (errorCopy.name === 'CastError')
      errorCopy = handleCastErrorDB(errorCopy);
    if (errorCopy.code === 11000)
      errorCopy = handleDuplicateFieldsDB(errorCopy);

    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(errorCopy);

    sendErrorProduction(errorCopy, response);
  }
};
