const express = require("express");
const router = express.Router();
const bookingController = require("../Controller/bookingController");
const authController = require("../Controller/authController");

router.get(
  "/checkout-session/:tourID",
  authController.protect,
  bookingController.getCheckoutSession
);
router.use(authController.protect);
router.use(authController.restrictTo("admin", "lead-guide"));
router
  .route("/")
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
