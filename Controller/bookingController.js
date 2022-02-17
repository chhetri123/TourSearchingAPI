const Tour = require("./../model/tourModels");
const Booking = require("./../model/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const handlerController = require("./handlerController");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1)  get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2) Create checkout season
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/240px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg",
        ],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  //  3) Create sesion as response
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) {
    return next();
  }
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split("?")[0]);
});

exports.createBooking = handlerController.createOne(Booking);
exports.getBooking = handlerController.getOne(Booking);
exports.getAllBooking = handlerController.getAll(Booking);
exports.updateBooking = handlerController.updateOne(Booking);
exports.deleteBooking = handlerController.deleteOne(Booking);
