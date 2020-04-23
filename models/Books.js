const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    comment : {type : String,}
},{versionKey : false})


const BookSchema = new mongoose.Schema({
    _id : {type : String,required : true},
    title : {type : String},
    comments : {type : Array,value : CommentSchema}
},{versionKey : false})

const Book = mongoose.model('Book',BookSchema);
module.exports = Book;