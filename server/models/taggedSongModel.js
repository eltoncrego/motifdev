//Require Mongoose
var mongoose = require('mongoose');
 
const taggedSongSchema = new mongoose.Schema({
  	user: String,
	songId: String,
  	tags: [String]
});

module.exports = mongoose.model('taggedSong', taggedSongSchema);
