const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
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
});
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
