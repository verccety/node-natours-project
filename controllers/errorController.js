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

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

// --------------------------------------------------------------------------------------

const sendErrorDevelopment = (error, request, response) => {
  // a) API
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error,
    });
  }

  // b) RENDERED SITE
  console.error('ERROR', error);
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message,
  });
};

const sendErrorProduction = (error, request, response) => {
  // a) API
  if (request.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to the client
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    // Programming or other unknown error: don't send error details
    // Send a generic message
    console.error('ERROR', error);
    return response.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // b) RENDERED SITE
  if (error.isOperational) {
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }

  // Programming or other unknown error: don't send error details
  // Send a generic message
  console.error('ERROR', error);
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

export default (error, request, response, next) => {
  // By specifying four parameters, Express automatically knows that entire function is an error-handling middleware
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, request, response);
  } else if (process.env.NODE_ENV === 'production') {
    // Spread operator will not copy the source object’s prototype to the
    // target object; using 'Object.assign' instead. Spread operator is just a sugar for
    // Object.assign with the first parameter set to empty object

    let errorCopy = Object.assign(error);
    if (errorCopy.name === 'CastError')
      errorCopy = handleCastErrorDB(errorCopy);
    if (errorCopy.code === 11000)
      errorCopy = handleDuplicateFieldsDB(errorCopy);

    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(errorCopy);

    if (errorCopy.name === 'JsonWebTokenError') errorCopy = handleJWTError();
    if (errorCopy.name === 'TokenExpiredError')
      errorCopy = handleJWTExpiredError();

    sendErrorProduction(errorCopy, request, response);
  }
};
