// package require
const express = require("express");
const morgan = require("morgan");
const { StatusCodes } = require("http-status-codes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// modules require
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const viewRoutes = require("./routes/viewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/errorController");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Global middleware
app.use(cors());
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
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

// Routes for Server-side
app.use("/", viewRoutes);
// Route Middleware (API routes )
app.use("/api", limiter);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
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
