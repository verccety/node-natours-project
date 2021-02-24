/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51INuyaFXQYWvKiypWUJSCOWk6XzI3NGLhFSlCPsXO38nAmoEaFyQkinhz0Eph1hfNNQvc5cjWpw1F3MsVZCwnFTX003yUDBAR5'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2) Create checkout form
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
