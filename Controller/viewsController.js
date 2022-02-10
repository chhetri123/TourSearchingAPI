const Tour = require("./../model/tourModels");
const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { StatusCodes } = require("http-status-codes");

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection and
  const tours = await Tour.find();

  // build template
  res.status(StatusCodes.OK).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!tour) {
    return next(
      new AppError("There is no tour with that name", StatusCodes.NOT_FOUND)
    );
  }
  // console.log(tour);
  res.status(StatusCodes.OK).render("tour", { title: tour.name, tour });
});
exports.getLogin = catchAsync(async (req, res, next) => {
  res
    .status(StatusCodes.OK)
    .render("login", { title: "Log into Your Account" });
});
exports.getAccount = (req, res) => {
  res.status(StatusCodes.OK).render("account", {
    title: "Your account",
  });
};
