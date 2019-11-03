//Require Mongoose
var mongoose = require('mongoose');
 
const taggedSongSchema = new mongoose.Schema({
  	userId: String,
	songId: String,
  	tagIds: [String]
});

module.exports = mongoose.model('taggedSong', taggedSongSchema);
