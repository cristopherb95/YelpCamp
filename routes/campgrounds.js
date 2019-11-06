var express = require('express');
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var middleware = require('../middleware');

router.get("/", (req, res) => {
    Campground.find({}, (err, campgrounds) => {
        if (err)
            console.log(err);
        else
            res.render("campgrounds/index", { campgrounds: campgrounds });
    });
});

router.post("/", middleware.isLoggedIn, (req, res) => {
    // Get data from form
    var author = {
        id: req.user.id,
        username: req.user.username
    };
    var newCampground = { name: req.body.name, image: req.body.image, description: req.body.description, author: author }
    // Create new campground, save in DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err)
            console.log(err);
        else {
            res.redirect("/campgrounds");
        }
    });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", (req, res) => {
    // Find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        }
        else {
            // Render show page with specified campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// UPDATE CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err)
            res.redirect("/campgrounds");
        else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});

//DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, (err, deletedCampground) => {
        if (err)
            res.redirect("/campgrounds");
        else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;