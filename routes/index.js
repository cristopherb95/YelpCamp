var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Campground = require('../models/campground');

router.get("/", (req, res) => {
    res.render("landing");
});

router.get("/register", (req, res) => {
    res.render("register", { page: 'register' });
});

router.post("/register", (req, res) => {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if (req.body.adminCode === 'ilikehamburgers') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            // Route fix
            req.flash('error', err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req,res, () => {
            req.flash('success', 'Welcome to Yelp Camp ' + user.username);
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login", { page: 'login' });
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out')
    res.redirect("/campgrounds");
});

// USER PROFILE
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash('error', "Something went wrong with finding user");
            return res.redirect("/campgrounds");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec( (err, campgrounds) => {
            if(err) {
                req.flash('error', "Something went wrong with finding user");
                return res.redirect("/campgrounds");
            }         
            res.render('users/show', {user: foundUser, campgrounds : campgrounds});
        })
    })
})

router.get("/users/:id/edit", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err)
            return res.redirect("/campgrounds");
        else {
            if (foundUser._id.equals(req.user._id)) {
               return res.render("users/edit", { user: foundUser });
            }
            else {
                req.flash('error', 'You don\'t have permission to do that');
                res.redirect("back");
            }
        }
    });
});

router.put("/users/:id",  (req, res) => {
    console.log('inside');
    User.findByIdAndUpdate(req.params.id, req.body.user, (err, foundUser) => {
        if (err)
            res.redirect("back");
        else {
            res.redirect("/users/" + req.params.id);
        }
    });
});

module.exports = router;