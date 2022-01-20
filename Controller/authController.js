const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsync(async (req, res) => {
  const {
    name,
    email,
    role,
    password,
    passwordConform,
    photo,
    changePasswordAt,
  } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConform,
    photo,
    changePasswordAt,
    role,
  });
  const token = signToken(newUser._id);

  res.status(StatusCodes.CREATED).json({
    status: "Success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // check password and email from request body is valid
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // check email & password exist or not
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError("Invalid Email or Password", StatusCodes.UNAUTHORIZED)
    );
  }
  // create token and send
  const token = signToken(user._id);
  res.status(StatusCodes.OK).json({
    status: "Success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check of it is valid?
  let token;
  console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return next(
      new AppError(
        "You are not logged in. Please login to get access",
        StatusCodes.UNAUTHORIZED
      )
    );

  // verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
  // check if user still exixts
  const currentUser = await User.findById(decode.id);
  if (!currentUser)
    return next(
      new AppError("User belong to this token does no longer exist."),
      StatusCodes.UNAUTHORIZED
    );

  // check if user changed password after the token issued
  const isChanged = currentUser.changePasswordAfter(decode.iat);
  if (isChanged) {
    return next(
      new AppError("User recently changed password. Please login again !")
    );
  }
  // next
  req.user = currentUser;
  // req.user=
  next();
});
exports.restrictTo = (...roles) => {
  // roles=["admin","lead-guide"]
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to delete Tour",
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
