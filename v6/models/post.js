var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    postNo: Number,
    subject: String,
    body: String,
    // author: {
    //     id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "User"
    //     },
    //     username: String
    // },
    fullname: String,
    username: String,
    day: Number,
    month: Number,
    praises: Number
});

module.exports = mongoose.model("Post", postSchema);