const mongoose = require('mongoose');

const taggedSongSchema = new mongoose.Schema({
  userId: String,
  songId: String,
  songName: String,
  artist: String,
  tagIds: [String],
});

module.exports = mongoose.model('taggedSong', taggedSongSchema);
