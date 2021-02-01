/* eslint-disable no-console */
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

module.exports = (error, request, response, next) => {
  // By specifying four parameters, Express automatically knows that entire function is an error handling middleware
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProduction(error, response);
  }
};
