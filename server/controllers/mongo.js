const mongoose = require('mongoose');
 
mongoose.connect('mongodb://localhost:27017/MotifTest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});