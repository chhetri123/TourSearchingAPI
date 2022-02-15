import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe(
  "pk_test_51KTQdlKIacAI6ryqRTTRiLuvwSPLvPpi6wk6VkgbqpzWeQFsofjqzerz0PK3WLjxZpx6GQ5V9o8TcAXXne4wVMWe00dVpjQStI"
);
export const bookTour = async (tourId) => {
  // 1) Get checkout  session from server
  try {
    const session = await axios({
      method: "GET",
      url: `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`,
    });
    console.log(session);

    // 2) Create checkout form + charge credit card

    // await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    window.open(session.data.session.url, "_blank");
  } catch (err) {
    console.log(err);
    showAlert("error", err.message);
  }
};
