const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const ApiFeatures = require("../utils/apiFeature");

const { StatusCodes } = require("http-status-codes");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError("Invalid Id Doc not found", 404));

    res.status(StatusCodes.NO_CONTENT).json({
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    if (!doc) return next(new AppError("Document  cannot be created", 404));

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError("Document cannot be created", 404));

    res.status(StatusCodes.OK).send({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    if (!doc)
      return next(
        new AppError("Document not found with that ID", StatusCodes.NOT_FOUND)
      );

    res.status(StatusCodes.OK).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourID) filter = { tour: req.params.tourID };
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const docs = await apiFeatures.query;
    res.status(StatusCodes.OK).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
