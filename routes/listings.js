const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedin } = require("../authmiddleware.js");
const { isOwner, validateListing } = require("../authmiddleware.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const { fileFilter } = require("../cloudConfig.js");
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const listingController = require("../controllers/listing.js");

router.route("/search").post(wrapAsync(listingController.searchListing));

router
  .route("/")
  .get(wrapAsync(listingController.indexListings))
  .post(
    isLoggedin,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing),
  );

router.get("/show/:id", wrapAsync(listingController.showListing));

router.get("/create", isLoggedin, listingController.createlistingForm);

router
  .route("/edit/:id")
  .get(isLoggedin, isOwner, wrapAsync(listingController.editlistingForm))
  .put(
    isLoggedin,
    isOwner,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.editListing),
  );

router
  .route("/filter/:category")
  .get(wrapAsync(listingController.filterListings));

router.get(
  "/delete/:id",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.deleteListing),
);
module.exports = router;
