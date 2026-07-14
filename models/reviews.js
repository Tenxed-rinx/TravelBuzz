const mongoose = require("mongoose");
const {Schema} = mongoose;

const reviewSchema = new Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
    },
    comment:String,
    created_at:{
        type:Date,
        default:Date.now
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

const Review = mongoose.model("review",reviewSchema);

module.exports = Review;