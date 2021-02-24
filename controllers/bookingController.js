/* eslint-disable import/prefer-default-export */
import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
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
      // success_url: `${request.protocol}://${request.get('host')}/?tour=${
      //   request.params.tourId
      // }&user=${request.user.id}&price=${tour.price}`,
      success_url: `${request.protocol}://${request.get('host')}/my-tours`,
      cancel_url: `${request.protocol}://${request.get('host')}/tour/${
        tour.slug
      }`,
      customer_email: request.user.email,
      client_reference_id: request.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [
            `${request.protocol}://${request.get('host')}/img/tours/${
              tour.imageCover
            }`,
          ],
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

// export const createBookingCheckout = catchAsync(
//   async (request, response, next) => {
//     // Temporary, unsecure!
//     const { tour, user, price } = request.query;

//     if (!tour || !user || !price) return next();

//     await Booking.create({ tour, user, price });

//     response.redirect(request.originalUrl.split('?')[0]);
//   }
// );

export const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const { id: user } = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};
export const webhookCheckout = catchAsync(async (request, response, next) => {
  const signature = request.headers['stripe-signature'];
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  response.status(200).json({
    received: true,
  });
});

export const getAllBookings = factory.getAll(Tour);
export const getBooking = factory.getOne(Booking);
export const createBooking = factory.createOne(Booking);
export const updateBooking = factory.updateOne(Booking);
export const deleteBooking = factory.deleteOne(Booking);
