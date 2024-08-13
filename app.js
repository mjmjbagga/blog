const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const {mongoDbUrl} = require("./config/database");
const {engine} = require("express-handlebars");
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
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

const {generateTime, select, paginate} = require("./helpers/handlebars-helpers");
//set template engine: if you do not set this then design implementation via handlebars will not work
app.engine("handlebars",engine({handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout: 'home', helpers:{generateTime:generateTime, select:select, paginate:paginate}}));
app.set('view engine', 'handlebars');

//Upload Middleware
app.use(upload());

//body parser: u will get data in req.body with this
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//method override
app.use(methodOverride("_method"));
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
const admin = require("./routes/admin/index");
const categories = require("./routes/admin/categories");
const posts = require("./routes/admin/posts");
app.use("/",home);
app.use("/admin",admin);
app.use("/admin/categories",categories);
app.use("/admin/posts",posts);

const port = process.env.PORT || 9112;
app.listen(port,() => {
    console.log(`listening to port ${port}`);
});