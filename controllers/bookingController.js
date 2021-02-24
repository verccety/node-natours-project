/* eslint-disable import/prefer-default-export */
import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';

export const getCheckoutSession = catchAsync(
  async (request, response, next) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // 1) Get the currently booked tour
    const tour = await Tour.findById(request.params.tourId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${request.protocol}://${request.get('host')}/?tour=${
        request.params.tourId
      }&user=${request.user.id}&price=${tour.price}`,
      cancel_url: `${request.protocol}://${request.get('host')}/tour/${
        tour.slug
      }`,
      customer_email: request.user.email,
      client_reference_id: request.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`http://www.natours.dev/img/tours/${tour.imageCover}`],
          amount: tour.price * 100,
          currency: 'usd',
          quantity: 1,
        },
      ],
    });

    response.status(200).json({
      status: 'success',
      session,
    });
  }
);

export const createBookingCheckout = catchAsync(
  async (request, response, next) => {
    // Temporary, unsecure!
    const { tour, user, price } = request.query;

    if (!tour || !user || !price) return next();

    await Booking.create({ tour, user, price });

    response.redirect(request.originalUrl.split('?')[0]);
  }
);
