const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../Controller/reviewController");
const authController = require("../Controller/authController");

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.createReview
  );
// POST /:tourID/reviews

module.exports = router;
