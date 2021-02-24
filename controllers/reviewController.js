import Review from '../models/reviewModel.js';
// import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Booking from '../models/bookingModel.js';
import * as factory from './handlerFactory.js';

export const setTourUserIds = (request, response, next) => {
  // If no tour id is specified in the body => define one from URL
  if (request.params.tourId) request.body.tour = request.params.tourId;
  request.body.user = request.user.id;
  next();
};

export const restrictNotBookedTour = catchAsync(
  async (request, response, next) => {
    const booking = await Booking.find({
      user: request.body.user,
      tour: request.body.tour,
    });
    if (booking.length === 0)
      return next(
        new AppError(`This tour hasn't been booked by this user before`, 401)
      );
    next();
  }
);

export const getAllReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
