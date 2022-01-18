const { StatusCodes } = require("http-status-codes");
const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.message.match(/"[^\"]*"/);
  const message = `Duplicate field value : ${value} Please use another value`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data :${value.join(". ")}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;

    // error coming from monoose
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
