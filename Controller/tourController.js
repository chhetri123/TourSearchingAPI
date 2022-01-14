const { StatusCodes } = require("http-status-codes");

const Tour = require("./../model/tourModels");
exports.bestTours = async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,ratingsAverage,price,summary,difficulty";
  next();
};
exports.getAllTours = async (req, res) => {
  try {
    // const tours = await Tour.find();

    const queryObj = { ...req.query };
    const excludedField = ["page", "sort", "limit", "fields"];
    excludedField.forEach((field) => delete queryObj[field]);

    // Advance level filtering
    queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    // //
    const query = Tour.find(JSON.parse(queryStr));

    // 1)Sorting
    if (req.query.sort) {
      const querySort = req.query.sort.split(",").join(" ");
      query.sort(querySort);
    } else {
      query.sort("-createdAt");
    }

    // 2)Field limits
    if (req.query.fields) {
      const queryFields = req.query.fields.split(",").join(" ");
      query.select(queryFields);
    } else {
      query.select("-__v");
    }

    // 3) Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 100;
    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);
    if (req.query.page) {
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) throw new Error("Page limit exceeds");
    }
    const tours = await query;
    res.status(StatusCodes.OK).send({
      results: tours.length,
      tours,
    });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).send({
      msg: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    res.status(StatusCodes.CREATED).send(tour);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(StatusCodes.MOVED_TEMPORARILY).send(tour);
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).send({ msg: err });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(StatusCodes.OK).send({
      tour,
    });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).send({ msg: err });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(StatusCodes.GONE).send({ message: "tour deleted " });
  } catch (err) {
    res.status(StatusCodes.NOT_FOUND).send({ msg: err });
  }
};
