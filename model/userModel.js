const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell your name"],
    trim: true,
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
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordConform = undefined;
  this.password = await bcrypt.hash(this.password, 12);
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
const User = mongoose.model("User", userSchema);

module.exports = User;
