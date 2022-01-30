const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../Controller/reviewController");
const authController = require("../Controller/authController");
router.use(authController.protect);
router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo("user"),
    reviewController.setUserTourIDs,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.isReview,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.isReview,
    reviewController.deleteReview
  );
// POST /:tourID/reviews

module.exports = router;
