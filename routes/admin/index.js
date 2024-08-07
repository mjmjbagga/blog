const express = require("express");
const router = express.Router();

//overwrite frontend, now it should pick backend files
router.all('/*', (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
});

router.get("/",(req,res)=>{
    res.render("admin/index");
});

module.exports = router;