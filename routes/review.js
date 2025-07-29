const express = require("express")
const mongoose = require('mongoose'); 
const router  = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const {listingSchema, reviewSchema} = require("../schema.js")
const Review = require("../models/review.js")
const Listing = require("../models/listing.js") 
const {isLoggedIn, isAuthor} = require("../middleware.js")

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return next(new ExpressError(400, error.details[0].message));
  }
  next();
}

router.post("/" , isLoggedIn,validateReview, wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    // console.log("New review saved");
    // res.send("New review saved");
    req.flash("success", "New Review Created!");

    res.redirect(`/listing/${listing._id}`)
}));

// DELETE
router.delete("/:reviewId" ,isLoggedIn, isAuthor, wrapAsync(async(req, res)=>{
    let {id, reviewId}  = req.params;

    await Listing.findByIdAndUpdate(id, {$pull :{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listing/${id}`)
}))

module.exports = router;