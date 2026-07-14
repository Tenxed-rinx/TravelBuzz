const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");
const mapapikey = process.env.MAP_API_KEY;

module.exports.searchListing = async (req, res, next) => {
  let destination = req.body.destination;
  let d_low = destination.toLowerCase();
  let d_cap = destination.toUpperCase();
  let d_camel = d_low.replace(d_low[0], d_low[0].toUpperCase());
  let alllisting = await Listing.find({
    $or: [
      { location: d_low },
      { location: d_cap },
      { location: d_camel },
      { location: destination },
    ],
  });
  res.render("./listings/index.ejs", { alllisting });
};

module.exports.indexListings = async (req, res) => {
  const alllisting = await Listing.find();
  res.render("./listings/index.ejs", { alllisting });
};

module.exports.showListing = async (req, res, next) => {
  let { id } = req.params;
  let listelement = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listelement) {
    req.flash("error", "Listing not found");
    res.redirect("/listings");
  } else {
    res.render("./listings/show.ejs", { listelement });
  }
};

module.exports.createlistingForm = (req, res) => {
  res.render("./listings/create.ejs");
};

module.exports.createListing = async (req, res, next) => {
  if (req.fileValidationError) {
    req.flash("error", "Only JPEG,PNG,JPG allowed.");
    return res.redirect(`/listings/edit/${req.params.id}`);
  }
  let listing = req.body.listing;
  listing.owner = req.user._id;

  const addlocationCoordinates = async () => {
    const query = req.body.listing["location"];

    const OSMmap_url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${mapapikey}`;

    const map_response = await fetch(OSMmap_url);
    if (!map_response.ok) {
      req.flash("error", "Map API request failed");
      return res.redirect("/listings/create");
    }

    const data = await map_response.json();
    if (!data.results.length) {
      req.flash("error", "Not Valid location");
      return res.redirect("/listings/create");
    }
    listing.geometry = {
      type: "Point",
      coordinates: [data.results[0].geometry.lng, data.results[0].geometry.lat],
    };
  };

  await addlocationCoordinates();

  try {
    if (req.file) {
      const uploadtoCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "TRAVELBUZZ_LIS_imgs" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadtoCloudinary();
      listing.image = {
        filename: result.public_id,
        url: result.secure_url,
      };
      await Listing.insertMany(listing);
      req.flash("success", "New Listing is Created");
      res.redirect("/listings");
    } else {
      if (listing.image) {
        req.flash("error", "Only JPEG,PNG,JPG allowed.");
        return res.redirect(`/listings/create`);
      }
      await Listing.insertMany(listing);
      req.flash("success", "New Listing is Created");
      res.redirect("/listings");
    }
  } catch (err) {
    next(err);
  }
};

module.exports.editlistingForm = async (req, res, next) => {
  const listelement = await Listing.findById(req.params.id);
  if (!listelement) {
    req.flash("error", "Lisitng not found for editing");
    res.redirect("/listings");
  } else {
    let editedimageURL = listelement.image.url;
    let part2 = "?&auto=format&fit=crop&h=200&w=200&q=60&blur=10";

    if (listelement.image.filename === "listingimage") {
      editedimageURL = editedimageURL.split("&")[0] + part2;
    } else
      editedimageURL = editedimageURL.replace(
        "upload/",
        "upload/c_fill,h_200,w_200/e_blur:300/",
      );
    res.render("./listings/edit.ejs", { listelement, editedimageURL });
  }
};

module.exports.editListing = async (req, res, next) => {
  if (req.fileValidationError) {
    req.flash("error", "Only JPEG,PNG,JPG allowed.");
    return res.redirect(`/listings/edit/${req.params.id}`);
  }

  let { id } = req.params;
  let listing = req.body.listing;

  const prevlisting = await Listing.findById(id);

  if (prevlisting.location !== listing["location"]) {
    const addlocationCoordinates = async () => {
      const query = req.body.listing["location"];

      const OSMmap_url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${mapapikey}`;

      const map_response = await fetch(OSMmap_url);
      if (!map_response.ok) {
        req.flash("error", "Map API request failed");
        return res.redirect("/listings/create");
      }

      const data = await map_response.json();
      if (!data.results.length) {
        req.flash("error", "Not Valid location");
        return res.redirect("/listings/create");
      }
      listing.geometry = {
        type: "Point",
        coordinates: [
          data.results[0].geometry.lng,
          data.results[0].geometry.lat,
        ],
      };
    };
    await addlocationCoordinates();
  }

  try {
    if (req.file) {
      const uploadtoCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "TRAVELBUZZ_LIS_imgs" },
            (error, result) => {
              if (error) return reject(error);

              resolve(result);
            },
          );
          stream.end(req.file.buffer);
        });
      };
      const result = await uploadtoCloudinary();
      listing.image = {
        filename: result.public_id,
        url: result.secure_url,
      };
    } else {
      if (listing.image) {
        req.flash("error", "Only JPEG,PNG,JPG allowed.");
        return res.redirect(`/listings/edit/${req.params.id}`);
      }
    }
    await Listing.findByIdAndUpdate(req.params.id, listing, {
      runValidators: true,
      new: true,
    });
    req.flash("success", "Listing Updated Successfully");
    return res.redirect(`/listings/show/${id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.filterListings = async (req, res, next) => {
  if (req.params.category === "Trending") {
    res.redirect("/listings");
  } else {
    const alllisting = await Listing.find({ category: req.params.category });
    res.render("./listings/index.ejs", { alllisting });
  }
};

module.exports.deleteListing = async (req, res, next) => {
  let { id } = req.params;
  let deletedlisting = await Listing.findByIdAndDelete(req.params.id);
  if (deletedlisting) {
    req.flash("secondary", "Lisintg is Deleted");
  } else {
    req.flash("error", "No such listing is present");
  }
  res.redirect("/listings");
};
