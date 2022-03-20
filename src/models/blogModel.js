const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim:true
    },
    autherID: { type: ObjectId, ref: "Auther", required: true, trim: true },

    tags:[{type:String},{trim:true}] ,

    category: {type:String, required:true,trim:true}, 

    isdeleted: {type:Boolean, default: false},

    ispublished: {type:Boolean, default: false},

    deletedAt:{type:Date, default: null},

    publishedAt:{type:Date, default: null}
    

}, { timestamps: true });

module.exports = mongoose.model('Blog12', blogSchema)


