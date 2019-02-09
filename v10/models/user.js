var mongoose = require("mongoose");
var passportLocalMongoose= require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
   username: {
       type: String,
       unique: true
   },
   fullname: String,
   password: String,
   year: String,
   branch: String,
   github: String,
   img: {data: Buffer, contentType: String },
//   posts: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Post"
//         }
//     ]
});

UserSchema.plugin(passportLocalMongoose);


module.exports=mongoose.model("User",UserSchema);