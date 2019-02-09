var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    // author: {
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "User"
    //     },
    fullname: String,
    username: String,
    day: Number,
    month: Number,
    postID: String
});

module.exports = mongoose.model("Comment", commentSchema);