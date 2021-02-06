import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import AppError from '../utils/appError.js';
import globalErrorHandler from '../controllers/errorController.js';
import tourRouter from '../routes/tourRoutes.js';
import userRouter from '../routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1) MIDDLEWARES
const app = express();

// Set security headers
app.use(helmet());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());

// Against XSS
app.use(xss());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
// Limit requests from same IP
app.use('/api', limiter);

// Test middleware
app.use((request, response, next) => {
  request.requestTime = new Date().toUTCString();
  next(); // next обязательный параметр для передачи управления по цепочке след. middleware
});

// 2) ROUTE HANDLERS

// 3) ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404)); // If the (next) function receives  an argument,
  //Express will automatically know that there was an error; applies to
  //every next function in every single middleware anywhere
});

app.use(globalErrorHandler);

export default app;
