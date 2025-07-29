if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express")
const app = express();
const path = require("path")
const mongoose = require('mongoose');
const methodOverride = require("method-override")
const port = 3000;
const Listing = require("./models/listing.js") 
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require("./models/review.js")

const listingsRoute = require('./routes/listing.js')
const reviewsRoute = require('./routes/review.js')
const userRoute = require('./routes/user.js')

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")

// let monoogse_url = 'mongodb://127.0.0.1:27017/wanderlust' 
let db_url = process.env.ATLAS_DB;  // AB DEPLY KR RHEE H TO YE PASS KRENGE

const store = MongoStore.create({
  mongoUrl:db_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
})

store.on("error", ()=>{
    console.log("Error in MONGO SESSION STORE", err);
})

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: true,
    cookie :{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"/views"))
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

main().then(()=>{
    console.log("Connection successful")
}).
catch(err => console.log(err));

async function main() {
  await mongoose.connect(db_url);
}


// app.get("/",(req,res)=>{
//     console.log("Hii Im root")
//     res.send("Hii i m root")
// })
app.get("/", (req, res) => {
  res.redirect("/listing");
});

// app.get("/testList",(req,res)=>{
//     const sampleList = new Listing({
//         title: "My new villa",
//         description:  "By the beach",
//         price:200,
//         location:"Jaladhar",
//         country: "India"
//     })

//     sampleList.save().then((res)=>{
//         console.log(res)
//     }).catch((err)=>{
//         console.log(err)
//     })
//     res.send("Sucessful added")
// })

app.use((req, res, next)=>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser", async(req, res)=>{
    let fakeUser = new User({
        email: "user123@gmail.com",
        username: "delta-stud"
    })

    let registeredUser = await User.register(fakeUser, "password")
    res.send(registeredUser);
})

app.use("/listing",listingsRoute);   // all calls of listing
app.use("/listing/:id/reviews", reviewsRoute); // all calls of listing
app.use("/", userRoute);

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page not found!!"))
// })

app.use((err, req, res, next) => {
    res.render("listing/error.ejs", { message: err.message }); // ✅ fixed here
});


app.listen(port,()=>{
    console.log("Listening")
})
