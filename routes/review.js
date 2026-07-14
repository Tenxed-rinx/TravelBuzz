const express = require("express");
const router = express.Router({mergeParams:true})
const wrapAsync = require("../utils/wrapAsync.js");

const {isLoggedin,validateReview,isAuthor} = require("../middleware.js");

const reviewController = require("../controllers/review.js");

router.post("/:id",isLoggedin,validateReview,wrapAsync(reviewController.createReview)) ;

router.delete("/:id/:review_id",isLoggedin,isAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;