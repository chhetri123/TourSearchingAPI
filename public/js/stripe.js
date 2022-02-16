import axios from "axios";
import { showAlert } from "./alerts";
// Use published key of Stripe
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

    // 2) Create checkout form + charge credit card
    if (process.env.NODE_ENV === "production") {
      await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    } else if (process.env.NODE_ENV === "development") {
      window.open(session.data.session.url, "_blank"); // For development mode
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.message);
  }
};
