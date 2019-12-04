// Require Mongoose
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  userId: String,
  tag: String,
});

module.exports = mongoose.model('tag', tagSchema);
