var mongoose = require('mongoose');

var boardSchema = mongoose.Schema({
    name : String,
    description : String
});

module.exports = mongoose.model('Board', boardSchema);
