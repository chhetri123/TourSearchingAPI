const express = require("express");
const morgan = require("morgan");
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/errorController");
const { StatusCodes } = require("http-status-codes");

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't found ${req.originalUrl} in this server`,
      StatusCodes.NOT_FOUND
    )
  );
});
app.use(globalErrorHandler);
module.exports = app;
