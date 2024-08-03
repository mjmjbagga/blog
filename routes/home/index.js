const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local");

router.get("/",(req,res)=>{
    res.render("home/index");
});

router.get("/login",(req,res)=>{
    res.render("home/login");
});

//it is calling from inside login post route

passport.use(new LocalStrategy({usernameField:'email'}, (email, password, done)=> {
    User.findOne({email:email}).then(user => {
        if(!user) {
            return done(null, false, {message:"no user found"});
        }
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) {
                return done(null, false, {message:"Err"+err});
            }

            if(matched) {
                return  done(null, user);
            } else {
                return done(null, false, {message:"password is incorrect"});
            }

        });
    });
}));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(async function(id, done){
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

router.post("/login",(req,res, next)=>{
    let errors = [];

    if(!req.body.email) {
        errors.push({message:"Please enter email"});
    }
    if(!req.body.password || req.body.password.trim() === "") {
        errors.push({message:"Please enter password"});
    }
    if(errors.length > 0) {
        res.render('home/login',{
            errors:errors,
            email:req.body.email
        });
    } else {

        passport.authenticate('local', {
            successRedirect: "/",
            failureRedirect: "/login",
            failureFlash: true
        })(req, res, next);
    }
});
router.get("/register",(req,res)=>{
    res.render("home/register");
});
router.post("/register",(req,res)=>{
    let errors = [];

    if(!req.body.firstName) {
        errors.push({message:"Please enter first name"});
    }
    if(!req.body.lastName) {
        errors.push({message:"Please enter last name"});
    }
    if(!req.body.email) {
        errors.push({message:"Please enter email"});
    }
    if(!req.body.password || req.body.password.trim() === "") {
        errors.push({message:"Please enter password"});
    }
    if(!req.body.passwordConfirm || req.body.passwordConfirm.trim() === "") {
        errors.push({message:"Please enter confirm password"});
    }
    if(req.body.password != req.body.passwordConfirm) {
        errors.push({message:"Password and confirm password does not match"});
    }
    if(errors.length > 0) {
        res.render('home/register',{
            errors:errors,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
        });
    } else {
        let errors = [];
       User.findOne({email:req.body.email}).then(isUserFound=>{
            if(!isUserFound) {
                //means user not found alreay
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email
                });
                bcrypt.genSalt(10, (genErr, salt)=>{
                    bcrypt.hash(req.body.password, salt, (hashErr, hash)=>{
                        newUser.password = hash;
                        newUser.save().then(userSaved=>{
                            req.flash('success_message','Your request is successfully completed');
                            res.redirect('/login');
                        });
                    });
                });
                
            } else {
                //user already exists
                 errors.push({message:"Email already exist with this user"});
                 res.render('home/register',{
                    errors:errors,
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                    email:req.body.email,
                });
            }
       }).catch(err => {
            errors.push({message:"Sorry, We could not complete your request because of some technical issue."});
            res.render('home/register',{
                errors:errors,
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                email:req.body.email,
            });
       });
    }
});

module.exports = router;