import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getOverview = catchAsync(async (request, response, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build tempalate

  // 3) Render template
  response.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(async (request, response, next) => {
  const tour = await Tour.findOne({ slug: request.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  response
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com 'self'"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

export const getLoginForm = (request, response) => {
  response
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self'")
    .render('login', {
      title: 'Log into your account',
    });
};

export const getAccount = (request, response) => {
  response
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self'")
    .render('account', {
      title: 'Your account',
    });
};

export const updateUserData = catchAsync(async (request, response, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    {
      name: request.body.name,
      email: request.body.email,
    },
    { new: true, runValidators: true }
  );

  response
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self'")
    .render('account', {
      title: 'Your account',
      user: updatedUser,
    });
});
