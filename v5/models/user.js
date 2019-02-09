var mongoose = require("mongoose");
var passportLocalMongoose= require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
   username: String,
   fullname: String,
   password: String,
   year: String,
   branch: String,
   github: String,
   img: {data: Buffer, contentType: String }
});

UserSchema.plugin(passportLocalMongoose);


module.exports=mongoose.model("User",UserSchema);