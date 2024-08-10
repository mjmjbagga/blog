const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require('../../models/Comment');
const {isEmpty, uploadDir} = require("../../helpers/upload-helper");
const fs = require('fs');
const Category = require("../../models/Category");
const {userAuthenticated} = require("../../helpers/authentication");
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

//overwrite frontend file, Now it shuld pick admin files
router.all('/*', (req, res,next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get("/",(req,res)=>{

    Post.find({}).populate('category').then(posts => {
        res.render("admin/posts", {posts:posts});
    }).catch(err => {
        res.send("Err: "+err);
    });

    
});

router.get("/create",(req,res)=>{
    Category.find({}).then(categories=>{
        res.render("admin/posts/create", {categories:categories});
    });
    
});
router.post("/create",(req,res)=>{
    let errors= [];

    if(!req.body.title) {
        errors.push({message:"Please add a title"});
    }
    if(!req.body.category) {
        errors.push({message:"Please add a category"});
    }
    if(!req.body.body) {
        errors.push({message:"Please add description"});
    }
    if(errors.length > 0) {
        res.render('admin/posts/create',{
            errors:errors
        });
    } else {
        let filename = '';
        if(!isEmpty(req.files)){
            let file = req.files.file;
            filename = Date.now()+'-'+file.name;
            file.mv('./public/uploads/'+filename,(err)=>{
                if(err) {
                    console.log("Err:"+err);
                }
            });
        }

        
        let allowComments = true;
        if(req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }
        const newPost = new Post({
            user:req.user.id,
            title: req.body.title,
            status:req.body.status,
            allowComments:allowComments,
            body:req.body.body,
            file:filename,
            category:req.body.category
        });
        newPost.save().then(postSaved => {
            req.flash('success_message','Your request is successfully completed');
            res.redirect('/admin/posts/');
        }).catch(err => {
            //res.render('admin/posts/create',{errors:validator.errors});
            res.send("Error:"+err);
        });
    }
    
});
router.get("/edit/:id",(req,res)=>{
    Post.findOne({_id:req.params.id}).then(post => {
        Category.find({}).then(categories=>{
            res.render("admin/posts/edit", {post:post, categories:categories});
        });
    }).catch(err => {
        res.send("Err: "+err);
    });
});
router.put("/edit/:id",(req,res)=>{
    Post.findOne({_id:req.params.id}).then(post => {
        let errors= [];
        if(!req.body.title) {
            errors.push({message:"Please add a title"});
        }
        if(!req.body.body) {
            errors.push({message:"Please add description"});
        }
        if(!req.body.category) {
            errors.push({message:"Please add category"});
        }
        if(errors.length > 0) {
            res.render('admin/posts/create',{
                errors:errors
            });
        } else {
            let allowComments = true;
            if(req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }

            post.user =  req.user.id;
            post.title =  req.body.title;
            post.status =  req.body.status;
            post.allowComments =  allowComments;
            post.body =  req.body.body;
            post.category= req.body.category
            

            if(!isEmpty(req.files)){
                let file = req.files.file;
                let filename = Date.now()+'-'+file.name;
                post.file =  filename;
                file.mv('./public/uploads/'+filename,(err)=>{
                    if(err) {
                        console.log("Err:"+err);
                    }
                });
            }

            post.save().then(updatedPost=>{
                req.flash('success_message','Your request is successfully completed');
                res.redirect("/admin/posts/");
            }).catch(err=>{
                res.send("Error: "+err);
            });

        }
    }).catch(err => {
        res.send("Err: "+err);
    });
});
router.delete("/:id",async (req,res)=>{
    try {
        const result = await Post.findOne({_id: req.params.id});
        if (!result) {
            return res.status(404).send("Post not found");
        }

        if (result.file && result.file.trim() !== '') {
            // fs.unlink(uploadDir + result.file, async (err) => {
            //     if (err) {
            //         return res.status(500).send("Error deleting file: " + err);
            //     }

            //     if(!result.comments.length < 1) {
            //         result.comments.forEach(comment=>{
            //             comment.remove();
            //         });
            //     }

            //     await Post.deleteOne({_id: req.params.id}); 
            // });
            try {
                await unlinkAsync(uploadDir + result.file);
            } catch (err) {
                // if (err.code !== 'ENOENT') {
                //     // If error is not about file not existing, return error
                //     return res.status(500).send("Error deleting file: " + err);
                // }
            }
        }
        if (result.comments && result.comments.length > 0) {
            for (const commentId of result.comments) {
                console.log(commentId);
                try {
                    await Comment.findByIdAndDelete(commentId);
                    console.log(`Comment ${commentId} deleted successfully.`);
                } catch (err) {
                    console.error(`Error deleting comment ${commentId}: ${err}`);
                }
            }
        }

        await Post.deleteOne({_id: req.params.id});
        req.flash('success_message', "Your request is successfully completed");
        res.redirect("/admin/posts/");

    } catch (err) {
        res.status(500).send("Err: " + err);
    }
});
module.exports = router;