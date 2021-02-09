import Review from '../models/reviewModel.js';
// import APIFeatures from '../utils/apiFeatures.js';
// import catchAsync from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

export const setTourUserIds = (request, response, next) => {
  // If no tour id is specified in the body => define one from URL
  if (request.params.tourId) request.body.tour = request.params.tourId;
  request.body.user = request.user.id;
  next();
};

export const getAllReviews = factory.getAll(Review);
export const getReview = factory.getOne(Review);
export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
