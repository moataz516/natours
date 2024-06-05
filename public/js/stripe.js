/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51PNaV3KyiCej5OPnOeRnbBq2KhuaAsAxF4RuxFyno5tZBTW5pdiKoqDrSG4OktlezVBTJqs8HgYuJgBMXt82oiun003m8TU53Z'
);
export const bookTour = async tourId => {
  try {
    // 1. get checkout session from API\
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2. create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
