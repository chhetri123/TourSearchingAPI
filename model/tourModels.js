const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      maxLength: [40, "Tour must have less than equal to 40 character"],
      minLength: [6, "Tour must have greater than equal to 6 character"],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "Tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "Tour must have a discount price ({VALUE}) less than price",
      },
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
      min: [1.0, "Rating must be greater than equal  to 1.0"],
      maxx: [5.0, "Rating must be less than equal to 5.0"],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have difficulty level"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty level must be either: easy, medium,difficult",
      },
    },

    imageCover: {
      type: String,
      required: [true, "Tour must have image cover"],
    },

    summary: {
      type: String,
      required: [true, "Tour must provides detailed information"],
      trim: true,
      minLength: [10, "Tour summary must be at least 10 characters"],
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
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    locations: [
      {
        type: {
          type: "String",
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Adding virtual properties
tourSchema.virtual("durationInWeeks").get(function () {
  // this "this" represent the whole document
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
  // justOne: true,
});
// Mongoose Middleware
// 1) Document middleware
tourSchema.pre("save", function (next) {
  this.slug = this.name.toLowerCase();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -changePasswordAt",
  });
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
