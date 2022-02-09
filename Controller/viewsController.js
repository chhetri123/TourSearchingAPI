const Tour = require("./../model/tourModels");
const catchAsync = require("./../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection and
  const tours = await Tour.find();

  // build template
  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  // console.log(tour);
  res.status(200).render("tour", { title: tour.name, tour });
});
exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render("login", { title: "Log into Your Account" });
});
