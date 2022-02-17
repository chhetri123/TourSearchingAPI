const multer = require("multer");
const sharp = require("sharp");
const { StatusCodes } = require("http-status-codes");
const Tour = require("./../model/tourModels");
const factory = require("./handlerController");
const ApiFeatures = require("../utils/apiFeature");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not a image ! Please upload only images",
        StatusCodes.NOT_ACCEPTABLE
      ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  console.log(req.body);
  next();
});
exports.bestTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,ratingsAverage,price,summary,difficulty";
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

//
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
exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlon, unit } = req.params;
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const [lat, lon] = latlon.split(",");
  if (!lat || !lon) {
    next(
      new AppError("Please provide lat and lon in format of lat,lon"),
      StatusCodes.BAD_REQUEST
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lon, lat], radius],
      },
    },
  });
  res.status(StatusCodes.OK).json({
    status: "Success",
    result: tours.length,
    data: {
      data: tours,
    },
  });
});
exports.toursWithinDistance = catchAsync(async (req, res, next) => {
  const { latlon, unit } = req.params;
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  const [lat, lon] = latlon.split(",");
  if (!lat || !lon) {
    next(
      new AppError("Please provide lat and lon in format of lat,lon"),
      StatusCodes.BAD_REQUEST
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [+lon, +lat],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
        ratingsAverage: 1,
      },
    },
  ]);
  res.status(StatusCodes.OK).json({
    status: "Success",
    result: distances.length,
    data: {
      data: distances,
    },
  });
});
