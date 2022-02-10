const crypto = require("crypto");
const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendMail = require("./../utils/email");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // creating cookies
  const cookiesOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  cookiesOption.secure = process.env.NODE_ENV === "production" ? true : false;
  res.cookie("jwt", token, cookiesOption);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, StatusCodes.CREATED, res);
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
  createSendToken(user, StatusCodes.ACCEPTED, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check of it is valid?
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = currentUser;
  // req.user=
  next();
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
exports.isLoggedIn = async (req, res, next) => {
  // getting token and check of it is valid?
  try {
    if (req.cookies.jwt) {
      // verification token

      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );
      // check if user still exixts
      const currentUser = await User.findById(decode.id);
      if (!currentUser) return next();

      // check if user changed password after the token issued
      const isChanged = currentUser.changePasswordAfter(decode.iat);
      if (isChanged) {
        return next();
      }
      // next
      res.locals.user = currentUser;
      // req.user=
      return next();
    }
    next();
  } catch (err) {
    return next();
  }
};
exports.restrictTo = (...roles) => {
  // roles=["admin","lead-guide"]
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to do this action",
          StatusCodes.FORBIDDEN
        )
      );
    }

    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // get user from POSTED email address
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        "User doesn't exist in this Email address",
        StatusCodes.NOT_FOUND
      )
    );

  // Generate random token
  try {
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Send it to the mail,
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    // message
    const message = `Forget your password ? Submit a Update request with your new password and passwordConform to :${resetURL}.\n If you didn't forget your password , please ignore this email`;

    // send mail
    await sendMail({ message, email: user.email });
    console.log(resetURL);
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Reset token sent in your email address",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending a mail. Please try again later",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new AppError("Invalid token or token epired", StatusCodes.NOT_FOUND)
    );

  user.password = req.body.password;
  user.passwordConform = req.body.passwordConform;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpires = undefined;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const { currentPassword, password, passwordConform } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  // check if posted password is correct or not
  const isCorrectPassword = await user.correctPassword(
    currentPassword,
    user.password
  );
  if (!isCorrectPassword) {
    return next(
      new AppError("Current password is incorrect"),
      StatusCodes.UNAUTHORIZED
    );
  }
  if (currentPassword === password)
    return next(
      new AppError(
        "New Password Cannot be same as OldPassword .Please enter different password",
        StatusCodes.BAD_REQUEST
      )
    );

  // update password

  user.password = password;
  user.passwordConform = passwordConform;
  await user.save();
  // log user in jwt
  createSendToken(user, StatusCodes.OK, res);
});
