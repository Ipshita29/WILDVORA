const mongoose=require("mongoose")
const review= new  mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    experienceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Experience",
        required:true
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    comment:{
        type:String
    },
    hostReply:{
        type:String
    }
},{timestamps:true})
module.exports= mongoose.model("Review",review)