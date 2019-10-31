//Require Mongoose
var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
 
const taggedSong = new Schema({
  	user: String,
	title: String,
	id: String
  	tags: [String]
});