const Review = require("../model/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerController");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/appError");

exports.setUserTourIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.isReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (req.user.role === "admin" || review.user._id + "" === req.user.id) {
    return next();
  }
  next(new AppError("Cannot update review", StatusCodes.FORBIDDEN));
};
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
