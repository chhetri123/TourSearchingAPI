const express = require("express");
const router = express.Router();
const viewController = require("./../Controller/viewsController");
const authController = require("./../Controller/authController");
const bookingController = require("./../Controller/bookingController");

router.get("/user/me", authController.protect, viewController.getAccount);
router.get("/user/my-tours", authController.protect, viewController.getMyTours);

router.use(authController.isLoggedIn);
// router.get("/", viewController.getOverview);
router.get(
  "/",
  bookingController.createBookingCheckout,
  viewController.getOverview
);

router.get("/tour/:slug", viewController.getTour);
router.get("/user/login", viewController.getLogin);
module.exports = router;
