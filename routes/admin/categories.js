const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");

router.all("/*", (req, res,next) => {
    req.app.locals.layout = "admin";
    next();
});

router.get("/",(req,res)=>{
    Category.find({}).then(categories => {
        res.render("admin/categories/index", {categories: categories});
    }).catch(err => {
        res.send("Err: "+err);
    });    
});
router.get("/create",(req,res)=>{
    res.render("admin/categories/create");    
});
router.post("/create",(req, res)=>{
    let errors = [];
    if(!req.body.name) {
        errors.push({message: "Please add a name"});
    }

    if(errors.length > 0) {
        res.render("admin/categories/create", {errors: errors});
    } else {
        const newCategory = new Category({
            name: req.body.name
        });
        newCategory.save().then(postSaved => {
            req.flash("success_message", "Your request is successfully completed");
            res.redirect("/admin/categories");
        }).catch(err => {
            res.send("Err: "+err);
        });
    }
});
router.get("/edit/:id",async (req,res)=>{
    Category.findOne({_id: req.params.id}).then(category => {
        res.render("admin/categories/edit", {category: category});
    }).catch(err => {
        res.send("Err: "+err);
    });
});
router.put("/edit/:id",async (req,res)=>{
   Category.findOne({_id:req.params.id}).then(category => {
        let errors= [];
        if(!req.body.name) {
            errors.push({message:"Please add a name"});
        }
       
        if(errors.length > 0) {
            res.render('admin/categories/create',{
                errors:errors
            });
        } else {
           
            category.name =  req.body.name;

            category.save().then(updatedPost=>{
                req.flash('success_message','Your request is successfully completed');
                res.redirect("/admin/categories");
            }).catch(err=>{
                res.send("Error: "+err);
            });

        }
    }).catch(err => {
        res.send("Err: "+err);
    });
});
router.get("/:id",async (req,res)=>{
    try {
        await Category.deleteOne({_id: req.params.id});
        req.flash('success_message', "Your request is successfully completed");
        res.redirect("/admin/categories");
    } catch (err) {
        res.status(500).send("Err: " + err);
    }
});
module.exports = router;