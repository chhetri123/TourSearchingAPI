const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell your name"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "lead-guide", "guide"],
      default: "user",
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please provide our valid email"],
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: [8, "Password must have at least 8 characters"],
      maxLength: [14, "Password must have at most 14 characters"],
      required: [true, "Provide your strong password"],
      select: false,
    },
    passwordConform: {
      type: String,
      required: [true, "Please conform your password"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password are not same",
      },
    },
    changePasswordAt: Date,
    photo: {
      type: String,
      default: "default.jpg",
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "user",
  localField: "_id",
  // justOne: true,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordConform = undefined;
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.changePasswordAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  enteredPassword,
  savedPassword
) {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

userSchema.methods.changePasswordAfter = function (JWT_IAT) {
  if (this.changePasswordAt) {
    const changePasswordTime = this.changePasswordAt.getTime() / 1000;
    return changePasswordTime > JWT_IAT;
  }

  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
