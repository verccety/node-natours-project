import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import AppError from '../utils/appError.js';
import globalErrorHandler from '../controllers/errorController.js';
import tourRouter from '../routes/tourRoutes.js';
import userRouter from '../routes/userRoutes.js';
import reviewRouter from '../routes/reviewRoutes.js';
import bookingRouter from '../routes/bookingRoutes.js';
import viewRouter from '../routes/viewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1) MIDDLEWARES
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set security headers
app.use(helmet());

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());

// Against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

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

app.use(compression());

// 2) ROUTE HANDLERS

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404)); // If the (next) function receives  an argument,
  //Express will automatically know that there was an error; applies to
  //every next function in every single middleware anywhere
});

app.use(globalErrorHandler);

export default app;
