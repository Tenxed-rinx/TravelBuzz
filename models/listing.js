const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const { required } = require("joi");

const listingschema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          : v,
    },
  },
  description: String,
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: [
      "Trending",
      "Rooms",
      "Pools",
      "Mountains",
      "Scenic",
      "Camping",
      "Farms",
      "Arctic",
      "Beach",
      "Tropic",
    ],
  },
});

//propogational delete
listingschema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("listings", listingschema);

module.exports = Listing;
