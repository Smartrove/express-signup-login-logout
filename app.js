const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
// const { config, engine } = require("express-edge");

const app = express();

//Passport Config
require("./config/passport");
//DB Config
const db = require("./config/keys").MongoURI;

//connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log(`database connected successfully`);
  })
  .catch((err) => {
    console.log(err);
  });
//edge middleware
// app.use(engine);
// app.set("views", `${__dirname}/views`);

//MiddleWare
app.use(expressLayouts);
app.set("view engine", "ejs");

//Body Parser
app.use(express.urlencoded({ extended: false }));
// app.use(bodyparser.urlencoded({ extended: false }));

//Express session middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware

app.use(flash());

//Global Variables for error display

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});

const port = 2000;

//Router
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
