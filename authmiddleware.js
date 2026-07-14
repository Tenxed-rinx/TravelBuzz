const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js"); //for hopscotch
const { reviewSchema } = require("./review_schema.js");
const { userSchema } = require("./user_schema.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Must be logged in");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.saveOriginalurl = (req, res, next) => {
  res.locals.savedOriginalurl = req.session.redirectUrl;
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing1 = await Listing.findById(id);

  if (!listing1.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this Listing");
    return res.redirect(`/listings/show/${id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  let { id, review_id } = req.params;
  let review1 = await Review.findById(review_id);

  if (!review1.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/show/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    console.log(error);
    let errmsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    console.log(error);
    let errmsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    console.log(error);
    let errmsg = error.details.map((el) => el.message).join(", ");
    req.flash("error", "Email must be valid.");
    res.redirect("/user/signup");
  } else {
    next();
  }
};
