const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    duration: {
      type: Number,
      required: [true, "Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have a Group Size"],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have difficulty level"],
    },

    imageCover: {
      type: String,
      required: [true, "Tour must have image cover"],
    },

    summary: {
      type: String,
      required: [true, "Tour must provides detailed information"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [String],
    startDates: {
      type: [Date],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtual: true },
  }
);
// Adding virtual properties
tourSchema.virtual("durationInWeeks").get(function () {
  // this "this" represent the whole document
  return this.duration / 7;
});

// Mongoose Middleware
// 1) Document middleware
tourSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase();
  next();
});

tourSchema.post("save", function (docs, next) {
  // console.log(docs);
  next();
});
// 2)Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  next();
});

// 3) aggregate middleware

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
