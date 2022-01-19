const { StatusCodes } = require("http-status-codes");
const Tour = require("./../model/tourModels");
const ApiFeatures = require("../utils/apiFeature");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
exports.bestTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,ratingsAverage,price,summary,difficulty";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await apiFeatures.query;
  res.status(StatusCodes.OK).send({
    results: tours.length,
    tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  if (!tour) return next(new AppError("Tour cannot be created", 404));

  res.status(StatusCodes.CREATED).json(tour);
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour)
    return next(
      new AppError("Tour not found with that ID", StatusCodes.NOT_FOUND)
    );

  res.status(StatusCodes.OK).send(tour);
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError("Tour cannot be created", 404));

  res.status(StatusCodes.OK).send({
    tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError("Tour not found", 404));

  res.status(StatusCodes.GONE).json({ message: "tour deleted " });
});
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        tours: { $sum: 1 },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // { $match: { _id: { $ne: "easy" } } },
  ]);
  res.status(StatusCodes.OK).json({
    status: "Success",
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plans = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
        },
        startDates: {
          $lt: new Date(`${year}-12-30`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        tourNumber: { $sum: 1 },
        tour: { $push: "$name" },
        avgPrice: { $avg: "$price" },
      },
    },
    { $sort: { tourNumber: -1 } },

    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    { $limit: 6 },
  ]);
  if (plans.length <= 0)
    return next(
      new AppError("No tour found in that plan", StatusCodes.NOT_FOUND)
    );
  res.status(StatusCodes.OK).json({
    status: "Success",
    plans,
  });
});
