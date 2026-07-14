if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const port = 7070;
const mongoose = require("mongoose");
const path = require("path");
const methodoveride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//routes
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require("console");

const dbUrl = process.env.ATLAS_DBURL;

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use(methodoveride("_method"));

app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET_KEYWORD,
  },
  touchAfter: 24 * 3600,
});

app.use(
  session({
    store,
    secret: process.env.SECRET_KEYWORD,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //time in ms //1 week
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, //for security
    },
  }),
);

store.on("error", () => {
  console.log("ERROR in Mongo Session Store", error);
});

//flash middleware
app.use(flash());

//passprt initialize
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.secondary = req.flash("secondary");
  res.locals.currUser = req.user;
  next();
});

main()
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.get("/demouser", async (req, res) => {
  let fakeuser = new User({
    email: "student@gmail.com",
    username: "student-delta",
  });
  let registereduser = await User.register(fakeuser, "helloworld");
  res.send(registereduser);
});

app.use("/listings", listingsRouter);
app.use("/listings/reviews", reviewsRouter);
app.use("/user", userRouter);
app.use((req, res, next) => {
  return next(new ExpressError(404, "Page Not Found"));
});

//error middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "something went wrong" } = err;
  res.status(status).render("./listings/error.ejs", { err });
});

app.listen(port, (req, res) => {
  console.log("server is listening");
});
