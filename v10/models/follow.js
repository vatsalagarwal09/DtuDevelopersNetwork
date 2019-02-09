var mongoose = require("mongoose");

var followSchema = mongoose.Schema({
    follower: String,
    following: String
});

module.exports = mongoose.model("Follow", followSchema);