const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  const reviewData = { ...req.body.review };
  if (!reviewData.created_at) {
    delete reviewData.created_at;
  }
  const newReview = new Review(reviewData);
  newReview.author = req.user._id;

  let newlisting = await Listing.findById(req.params.id);
  newlisting.reviews.push(newReview);

  await newReview.save();
  await newlisting.save();
  req.flash("success", "Review Added");
  res.redirect(`/listings/show/${newlisting._id}`);
};

module.exports.deleteReview = async (req, res, next) => {
  let { id, review_id } = req.params;
  let sd = await Review.findByIdAndDelete(review_id);
  if (sd) {
    let gh = await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: review_id },
    });
    req.flash("secondary", "Review Deleted");
  } else {
    req.flash("error", "No such review found");
  }
  res.redirect(`/listings/show/${id}`);
};
