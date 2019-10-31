//Require Mongoose
var mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
 
const taggedSongSchema = new Schema({
  	user: String,
	title: String,
	id: String
  	tags: [String]
});

const taggedSong = mongoose.model('taggedSong', taggedSongSchema);
