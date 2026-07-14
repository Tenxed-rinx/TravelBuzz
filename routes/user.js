const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveOriginalurl, validateUser } = require("../middleware.js"); //save the original url before
const userController = require("../controllers/user.js");

router
  .route("/signup")
  .get(userController.usersignupForm)
  .post(validateUser, wrapAsync(userController.usersignUp));

router
  .route("/login")
  .get(userController.userloginForm)
  .post(
    saveOriginalurl,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    userController.userlogIn,
  );

router.get("/logout", userController.userlogOut);

module.exports = router;
