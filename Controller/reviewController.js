const Review = require("../model/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const { StatusCodes } = require("http-status-codes");

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({
    status: "Success",
    review,
  });
});
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourID) filter = { tour: req.params.tourID };
  const reviews = await Review.find(filter);
  res.status(StatusCodes.OK).json({
    status: "Success",
    result: reviews.length,
    reviews,
  });
});
