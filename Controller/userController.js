const User = require("./../model/userModel");
const { StatusCodes } = require("http-status-codes");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    result: users.length,
    users,
  });
});
const filterObj = (obj, ...filter) => {
  const filteredObj = {};
  Object.keys(obj).forEach((el) => {
    if (filter.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConform) {
    return next(
      new AppError(
        "This route is not for password update.Please use /updateMyPassword",
        StatusCodes.FORBIDDEN
      )
    );
  }

  // filtering the request body
  const filteredBody = filterObj(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    user,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
