const express = require("express")
const router  = express.Router();
const User = require("../models/user");
const passport = require("passport");
const {saveRedirecturl} = require("../middleware")

router.get("/signup",(req, res)=>{
    res.render("user/signup.ejs")
})

router.post("/signup", async(req, res)=>{
    try{let {username, email, password} = req.body;
    let newUser = new User({username, email});
    let registeredUser = await User.register(newUser, password)
    console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
        else{
            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listing")
        }
    })
    } 
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup")
    }
})

router.get("/login",(req, res)=>{
    res.render("user/login.ejs")
})

router.post("/login", saveRedirecturl, passport.authenticate('local', { failureRedirect: '/login' , failureFlash: true}) ,async(req, res)=>{
     req.flash("success", "Welcome to wonderlust! You are logged in!");
     let redirectUrl = res.locals.redirectUrl;
     if(redirectUrl){
        res.redirect(redirectUrl);
     }
     else{
        res.redirect("/listing")
     }
})

router.get("/logout", (req, res, next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        else{
            req.flash("success", "You logged out successfully");
            return res.redirect("/listing")
        }
    })
})

module.exports = router