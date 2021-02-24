import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const alerts = (request, response, next) => {
  const { alert } = request.query;
  if (alert === 'booking')
    response.locals.alert =
      "Your booking was successful! Please check your e-mail for confirmation. If your booking doesn't show up here immediately, please come back later.";
  next();
};

export const getOverview = catchAsync(async (request, response, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build tempalate

  // 3) Render template
  response
    .status(200)
    .set('Content-Security-Policy', "connect-src https://*.stripe.com 'self'")
    .render('overview', {
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
      "connect-src   https://*.stripe.com https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com 'self'"
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

export const getMyTours = catchAsync(async (request, response, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: request.user.id }).select('tour');

  // 2 Find tours
  const tourIds = bookings.map((obj) => obj.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  response.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
