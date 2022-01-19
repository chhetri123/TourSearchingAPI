const express = require("express");
const router = express.Router();
const authController = require("./../Controller/authController");

const tourController = require("../Controller/tourController.js");
// router.param("id", tourController.checkId);
router
  .route("/top-5-tours")
  .get(tourController.bestTours, tourController.getAllTours);
router.route("/tourStats").get(tourController.getTourStats);
router.route("/monthlyPlan/:year").get(tourController.getMonthlyPlan);
router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = router;
