var mongoose = require('mongoose');

var replySchema = mongoose.Schema({
    parentThread : String,
    poster: String,
    replyBody: String,
});

module.exports = mongoose.model('Reply', replySchema);
