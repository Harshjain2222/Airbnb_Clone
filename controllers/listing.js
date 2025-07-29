const Listing = require("../models/listing")

module.exports.index = async (req, res) => {
    // Listing.find({}).then((res)=>{
    //     console.log(res);
    // }).catch((err)=>{
    //     console.log(err)
    // })
    // res.send("Hii workking fine")

    const allListing = await Listing.find({});
    res.render("listing/index.ejs", { allListing })
}

module.exports.new = (req, res) => {
    // if(!req.isAuthenticated()){
    //     req.flash("error","You must logged in!")
    //     return res.redirect("/login")
    // }  it is a middelware
    res.render("listing/new.ejs")
}

module.exports.show = async (req, res) => {
    let { id } = req.params;
    let data = await Listing.findById(id)
        .populate({ 
            path: "reviews", 
            populate: { 
                path: "author" 
            },
        })
        .populate("owner");
    // console.log(data);
    // res.send("Loading data")
    if (!data) {
        req.flash("error", " Listing u requested for does not exist");
        return res.redirect("/listing")
    }
    res.render("listing/show.ejs", { data });
}

module.exports.create = async (req, res, next) => {
    // if (!req.body.title || !req.body.price || !req.body.location || !req.body.country) {
    //     throw new ExpressError(400, "Missing required fields!");
    // }
    // No need to check individual use schema validatopr
    // console.log(req.body);

    let url = req.file.path;
    let fileName = req.file.filename

    let { title, description, price, location, country, image } = req.body;
    const sampleList = new Listing({ title, description, price, location, country, image });
    sampleList.owner = req.user._id;
    sampleList.image = {url, fileName}; 

    await sampleList.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
}

module.exports.edit= async (req, res) => {
    let { id } = req.params;
    const data = await Listing.findById(id);
    if (!data) {
        req.flash("error", " Listing u requested for does not exist");
        return res.redirect("/listing")
    }
    res.render("listing/edit", { data })
}

module.exports.update = async (req, res) => {
    if (!req.body.title || !req.body.price || !req.body.location || !req.body.country) {
        throw new ExpressError(400, "Missing required fields!");
    }
    let { id } = req.params;
    let sampleList =  await Listing.findByIdAndUpdate(id, {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        location: req.body.location,
        country: req.body.country
    });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let fileName = req.file.filename
        sampleList.image = {url, fileName}; 
        await sampleList.save();
    }

    // res.redirect("/listing")
    req.flash("success", "Listing updated");
    res.redirect(`/listing/${id}`)
}

module.exports.destroy = async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listing");
}