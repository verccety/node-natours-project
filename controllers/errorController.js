module.exports = (error, request, response, next) => {
  // By specifying four parameters, Express automatically knows that entire function is an error handling middleware
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
