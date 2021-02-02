class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //to distinguish our errors from programming errors

    Error.captureStackTrace(this, this.constructor); //function call is not gonna appear in the stack trace, and will not pollute it
  }
}

export default AppError;
