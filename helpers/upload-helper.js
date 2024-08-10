const path = require("path");

module.exports = {
    uploadDir:path.join(__dirname, "../public/uploads/"),
    isEmpty:function(obj){
        if(obj && typeof obj === "object" && !Array.isArray(obj)) {
            for(let key in obj) {
                if(Object.keys(obj).length === 0) {
                    return true;
                }
                return false;
            }
        }
        return true;
    }
};