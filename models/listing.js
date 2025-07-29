const mongoose = require('mongoose');
const Review = require('./review.js')
const Schema = mongoose.Schema;
const listSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1748156783945-c8c585c403b3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1748156783945-c8c585c403b3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v
        }
    },
    price: Number,
    location:String,
    country: String,
    reviews :[
        {
            type: Schema.Types.ObjectId,
            ref :"Review",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref :"User",
    }

})

listSchema.post("findOneAndDelete", async(list)=>{
    if(list){
    await Review.deleteMany({_id : {$in: list.reviews}})
    }
})

const Listing = mongoose.model("Listing", listSchema);
module.exports=Listing;