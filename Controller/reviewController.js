const Review = require("../model/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    review,
  });
});
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().select("-__v");
  res.status(StatusCodes.OK).json({
    status: "Success",
    result: reviews.length,
    reviews,
  });
});
