const Tour = require("./../model/tourModels");
const User = require("./../model/userModel");
const Booking = require("./../model/bookingModel");

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

exports.getMyTours = async (req, res, next) => {
  // 1) Find all booking
  const { bookings } = await User.findById(req.user.id).populate({
    path: "bookings",
    select: "guides",
  });

  // console.log(booking);
  // console.log(req.user);
  // 2) Find tours with the retuend IDs
  const tours = await Promise.all(
    bookings.map(async (tours) => await Tour.findById(tours.tour.id))
  );
  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
};
