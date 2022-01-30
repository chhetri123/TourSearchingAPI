const mongoose = require("mongoose");
const Tour = require("./tourModels");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      max: [5.0, "Rating must be less than 5.0"],
      min: [1.0, "Rating must be greater than 1.0"],
      default: 1.0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review most belong to tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review most belong to User"],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
reviewSchema.statics.calcRatingAvg = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0]?.avgRating || 4.5,
    ratingQuantity: stats[0]?.nRating || 0,
  });
};
reviewSchema.pre(/findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});
reviewSchema.post(/findOneAnd/, async function () {
  await this.review.constructor.calcRatingAvg(this.review.tour);
});
reviewSchema.post("save", function () {
  this.constructor.calcRatingAvg(this.tour);
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
