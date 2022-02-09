const express = require("express");
const router = express.Router();
const viewController = require("./../Controller/viewsController");
const authController = require("./../Controller/authController");

router.use(authController.isLoggedIn);
router.get("/", viewController.getOverview);
router.get("/tour/:slug", viewController.getTour);
router.get("/user/login", viewController.getLogin);
module.exports = router;
