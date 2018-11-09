var mongoose = require('mongoose');

var threadSchema = mongoose.Schema({
    name : String,
    initialPost : String,
    parentBoard: String
});

module.exports = mongoose.model('Thread', threadSchema);
