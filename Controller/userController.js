const multer = require("multer");

const User = require("./../model/userModel");
const { StatusCodes } = require("http-status-codes");
const factory = require("./handlerController");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/users");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not a image ! Please upload only images",
        StatusCodes.NOT_ACCEPTABLE
      ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single("photo");

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
  if (req.file) filteredBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(StatusCodes.NO_CONTENT).json({
    status: "success",
    data: null,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use /signup",
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
