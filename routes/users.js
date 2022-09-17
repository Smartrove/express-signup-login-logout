const express = require("express");
const { model } = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
//User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "please fill all required fields" });
  }

  //check passwords match

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  //check password length

  if (password.length < 6) {
    errors.push({ msg: "password must not be lesser than 6 characters" });
  }

  //redirect to register
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    //Validation passed
    User.findOne({ email: email })
      .then((user) => {
        //User exist
        errors.push({ msg: "Email has been registered" });

        if (user) {
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              //set password to hashed
              newUser.password = hash;

              //save user
              newUser
                .save()
                .then((user) => {
                  req.flash(
                    "success_msg",
                    "You are now registered, you can now login"
                  );
                  res.redirect("/users/login");
                })
                .catch((err) => console.log(err));
            });
          });
        }
      })
      .catch();
  }
});

// //Route Login Handle
router.post("/login", function (req, res) {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
    (req, res) => {
      res.redirect("/dashboard");
    };
  res.render("dashboard");
  // next();
});

// Logout Route Handle
// router.get("/logout", (req, res) => {
//   req.logout();
//   req.flash("success_msg", "You are logged out");
//   res.redirect("/users/login");
// });

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
