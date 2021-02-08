import Review from '../models/reviewModel.js';
// import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';

export const getAllReviews = catchAsync(async (request, response, next) => {
  const query = Review.find().select('-__v -id');
  const reviews = await query;

  response.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const createReview = catchAsync(async (request, response, next) => {
  const newReview = await Review.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
