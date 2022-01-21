// package require
const express = require("express");
const morgan = require("morgan");
const { StatusCodes } = require("http-status-codes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
// modules require
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/errorController");

const app = express();

// Global middleware
app.use(helmet());
app.use(express.static(`${__dirname}/public`));
app.use(express.json({ limit: "10kb" }));

// data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingQuantity",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
//
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: "Too many request , please try again after 1 hours",
});
// Route Middleware
app.use("/api", limiter);
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
