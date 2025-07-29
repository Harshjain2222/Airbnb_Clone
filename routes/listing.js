const express = require("express")
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js")
const Listing = require("../models/listing.js")
const { isLoggedIn, isOwner } = require("../middleware.js")
const listingController = require("../controllers/listing.js")
const multer  = require('multer')
const {cloudinary, storage} = require("../cloudinaryConfig.js")

//const upload = multer({ dest: 'uploads/' }) // YE TO LOCAL ME STORE KRNE KE LIYE HAI
const upload = multer({storage})


function validateListing(req, res, next) {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        return next(new ExpressError(400, error.details[0].message));
    }
    next();
}


//INDEX ROUTE 
router.get("/", wrapAsync(listingController.index))    

//NEW ROUTE 
router.get("/new", isLoggedIn, listingController.new);

// SHOW ROUTE 
router.get("/:id", wrapAsync(listingController.show))  
 
// CREATE route for image link
router.post("/", isLoggedIn,upload.single('image') , validateListing, wrapAsync(listingController.create));  //-----------------FOR LINK
router.post("/", isLoggedIn, validateListing, upload.single('image'), wrapAsync(listingController.create));  //-----------------FOR LINK
// router.post("/", upload.single('image') ,(req, res)=>{
//     console.log("Route hitted")
//     console.log(req.file)
//     res.send(req.file);
// }) ;              //--------------------FOR Image UPLOAD

//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit))

// UPDATE ROUTE
router.put("/:id", validateListing, isLoggedIn, isOwner, upload.single('image'),  wrapAsync(listingController.update))


//DELETE ROUTE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroy))

module.exports = router;