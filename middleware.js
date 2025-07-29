const Listing = require("./models/listing")
const Review = require("./models/review")

module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must logged in!")
        return res.redirect("/login")
    }
    next();
}

module.exports.saveRedirecturl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
}

module.exports.isOwner = async(req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "U don't have permission to edit or delete it");
        return res.redirect(`/listing/${id}`)
    }
    next()
}

module.exports.isAuthor = async(req, res, next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "U are not author of this review");
        return res.redirect(`/listing/${id}`)
    }
    next()
}