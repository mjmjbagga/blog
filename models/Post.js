const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const Schema = mongoose.Schema;

mongoose.plugin(slug);

const PostSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    category:{
        type: Schema.Types.ObjectId,
        ref:'categories'
    },
    title:{
        type:String,
        required:true
    },
    file:{
        type:String
    },
    status:{
        type:String,
        default:"public"
    },
    allowComments:{
        type:Boolean,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        slug:"title"
    },
    comments:[{
        type:Schema.Types.ObjectId,
        ref:'comments'
    }],
    date:{
        type: Date,
        default:Date.now()
    }
},{usePushEach:true});
module.exports = mongoose.model("posts", PostSchema);