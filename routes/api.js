/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const mongoose = require('mongoose');
const MONGODB_CONNECTION_STRING = process.env.DB;
const Book = require('../models/Books')
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
const db = mongoose.connection;
mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser : true,useUnifiedTopology:true})


db.once('open',async ()=> await console.log("Connected to the database...."))
module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      await Book.find({},async (err,books) => {
        if(err) console.log(err)
        if(!books) await res.status(200).json(books)
        let bookCopy = [...books];
        let response = []
        bookCopy.forEach(book => {
          response.push({
            title : book.title,
            _id : book._id,
            commentcount : book.comments.length
          })
        })
        await res.status(200).json(response)
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      
      
      //response will contain new book object including atleast _id and title
    
      if(!title) res.status(200).send("No title provided")
        const newBook = new Book({_id : ObjectId().toString(),title : title})
        Book.findOne({title},(err,book) => {
          if(err) console.log(err)
          if(book !== null) {
            res.status(200).send(`Book named ${title} already exists`)
          } else {
            newBook.save((err,book) => {
              if(err) console.log(err)
              res.json(book)
            })
          }
        })
      })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({},(err,books) => {
        res.status(200).send("complete delete successful")
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if(!bookid) res.status(200).send("No _id provided")
      Book.findOne({_id : bookid},(err,book)=> {
        if(err) console.log(err)
        if(!book) {
          res.status(200).send("Book doesn't exist.")
        } else {
          res.status(200).json(book)
        }
      })
    })
    
    .post(function(req, res){
      var id = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      if(!id && !comment) res.status(200).send("Either no id or no comment is provided.")
      Book.findOne({_id : id},(err,book) => {
        if(err) console.log(err)
        if(book !== null) {
          
          let comments = book.comments;
          comments.push(comment);
          book.comments = [];
          book.comments = [...comments];
          book.save((err,doc) => {
            if(err) console.log(err)
            res.status(200).json({
              title : doc.title,
              _id : doc._id,
              'commentcount' : doc.comments.length
            })
          })
        } else {
          res.status(200).send("Book not found with the given id")
        }
      })
    })
    
    .delete(function(req, res){
      var id = req.params.id;
      //if successful response will be 'delete successful'
      if(!id) res.status(200).send("No book id was provided.")
      Book.findOneAndRemove({_id : id},(err,book) => {
        if(err) console.log(err);
        if(book._id === id) {
          res.status(200).send("delete successful.")
        } else {
          res.status(200).send("delete unsuccessful.")
        }
      })
    });
  
};
