const express = require("express");
const router = express.Router();
const authController = require("./../Controller/authController");

const tourController = require("../Controller/tourController.js");
const reviewRoutes = require("./reviewRoutes");

// nested route middleware for tour and review
router.use("/:tourID/reviews", reviewRoutes);

router
  .route("/top-5-tours")
  .get(tourController.bestTours, tourController.getAllTours);
router.route("/tourStats").get(tourController.getTourStats);

router
  .route("/monthlyPlan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyPlan
  );
router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
