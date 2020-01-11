var express = require('express');
var router = express.Router({ mergeParams: true });
var User = require('../models/user');
var Campground = require('../models/campground');

// USER PROFILE
router.get("/:id", (req, res) => {
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

router.get("/:id/edit", (req, res) => {
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

router.put("/:id",  (req, res) => {
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