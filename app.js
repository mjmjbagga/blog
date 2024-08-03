const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const {mongoDbUrl} = require("./config/database");
const {engine} = require("express-handlebars");
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

//connection to database
mongoose.connect(mongoDbUrl).then(dbConnected=>{
    console.log("Successfully connected to DB");
}).catch(dbConnectionErr => {
    console.log("DB connection failed:"+dbConnectionErr);
});

//with this,we can use static files from public folder
app.use(express.static(path.join(__dirname,'public')));

//set template engine: if you do not set this then design implementation via handlebars will not work
app.engine("handlebars",engine({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home'}));
app.set('view engine', 'handlebars');

//body parser: u will get data in req.body with this
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//flash uses session
app.use(session({
    secret:"secsess3August",
    resave:true,
    saveUninitialized: true
}));
app.use(flash());

//passport: middleware is used for handling authentication. crucial for setting up and managing user authentication sessions with Passport.js
app.use(passport.initialize());
app.use(passport.session());

//local variables for middleware
app.use((req,res,next)=>{
    res.locals.user = res.user || null;
    res.locals.success_message = req.flash("success_message");
    res.locals.error_message = req.flash("error_message");
    res.locals.error = req.flash("error");
    next();
});

//include route files
const home = require("./routes/home/index");
app.use("/",home);

const port = process.env.PORT || 9112;
app.listen(port,() => {
    console.log(`listening to port ${port}`);
});