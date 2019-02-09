var express                =  require("express"),
    mongoose               =  require("mongoose"),
    passport               =  require("passport"),
    User                   =  require("./models/user"),
    Post                   =  require("./models/post"),
    Comment                =  require("./models/comment"),
    bodyParser             =  require("body-parser"),
    LocalStrategy          =  require("passport-local"),
    passportLocalMongoose  =  require("passport-local-mongoose"),
    sendAlert              =  require('alert-node'),
    multer                 =  require("multer");
    
var app = express();

mongoose.connect("mongodb://localhost:27017/devnetDB", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "hiii",
    resave: false,
    saveUninitialized: false
}));

app.use(function(req,res,next){
   res.locals.currentUser=req.user;
   
   next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

//home route
app.get("/",function(req,res){
   Post.find({}, function(err, posts) {
                if (err) {
                    res.json({
                        status: "error",
                        message: err,
                    });
                }
                // console.log(posts);
                res.render("home", {currentUser: req.user, posts: posts});
            });
});

// logged in home route
app.get("/home/:userid",function(req,res){
  Post.find({}, function(err, posts) {
                if (err) {
                    res.json({
                        status: "error",
                        message: err,
                    });
                }
                // console.log(posts);
                res.render("home2", {userid: req.params.userid, posts: posts, currentUser: req.user});
            });
});

//addpost route
app.get("/addpost/:id", isLoggedIn, function(req,res){
   User.findById(req.params.id).exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            res.render("addpost", {user: foundUser, currentUser: req.user});
        }
    }); 
});

//add new post route
app.post("/addpost/:id", function(req, res){
   var today = new Date();
   var day = today.getDate();
   var month = today.getMonth()+1;
   User.findById(req.params.id, function (err, user) {
        if (err){
            res.send(err);
        }
        else {
            var username = user.username;
            var fullName = user.fullname;
            Post.create(new Post({subject: req.body.subject, body: req.body.body, day:day, month: month, username: username, fullname: fullName }), function(err, newPost){
            if(err){
                console.log(err);
                return res.render('addpost');
            }
            else{
                    //redirect back to campgrounds page
                    res.redirect("/profile/" + req.params.id);    
                }
            });
        }
    });
  
});

//users route
app.get("/users",function(req,res){
    User.find({}, function(err, users) {
        if(err){
            res.send(err);
        } else {
            // console.log(users);
            res.render("users", {currentUser: req.user, allusers: users});
        }
    });
});

//about route
app.get("/about",function(req,res){
   res.render("about", {currentUser: req.user}); 
});

// //profile route
// app.get("/profile", isLoggedIn, function(req, res){
//     res.render("profile",{currentUser: req.user});
// });

app.get("/profile/:id", isLoggedIn, function(req, res){
    User.findById(req.params.id, function (err, foundUser) {
        if (err){
            res.send(err);
        }
        else {
            // var username = user.username;
            Post.find({ username: foundUser.username}, function(err, posts) {
                if (err) {
                    res.json({
                        status: "error",
                        message: err,
                    });
                }
                console.log(posts);
                res.render("profile", {user: foundUser, currentUser: req.user, posts: posts });
            });
        }
    });
});

app.get("/profile/:userid/:viewUserName", isLoggedIn, function(req, res){
    // var username = req.params.viewUserName;
    User.find({username: req.params.viewUserName}, function (err, foundUser) {
        if (err){
            res.send(err);
        }
        else {
            console.log(foundUser);
             //var username = foundUser.username;
            // Post.find({ username: username}, function(err, posts) {
            //     if (err) {
            //         res.json({
            //             status: "error",
            //             message: err,
            //         });
            //     }
            //     console.log(posts);
            //     console.log(foundUser);
            //     res.render("profile2", {viewUser: foundUser, posts: posts });
            // });
            res.render("profile2", {viewUser: foundUser.username, currentUser: req.user });
        }
    });
});

//FULLPOST ROUTE
app.get("/fullpost/:userid/:postid", isLoggedIn, function(req, res) {
    var userid = req.params.userid;
    Post.findById(req.params.postid, function (err, foundPost) {
        if (err){
            res.send(err);
        }
        else {
                //console.log(posts);
                Comment.find({postID: req.params.postid}, function(err, comments) {
                         if (err) {
                            res.json({
                                status: "error",
                                message: err,
                            });
                        }
                        // console.log(posts);
                        res.render("postfull", {post: foundPost, userid: userid, comments: comments, currentUser: req.user});
                    });
        }
    });
});

//COMMENT
app.post("/comment/:userid/:postid", isLoggedIn, function(req, res) {
   var today = new Date();
   var day = today.getDate();
   var month = today.getMonth()+1;
   Post.findById(req.params.postid, function (err, post) {
        if (err){
            res.send(err);
        }
        else {
            User.findById(req.params.userid, function(err, user) {
            if(err){
                console.log(err);
            }
            else{
                var username = user.username;
                var fullName = user.fullname;
                Comment.create(new Comment({text: req.body.text, day:day, month: month, username: username, fullname: fullName, postID: req.params.postid }), function(err, newComment){
                if(err){
                    console.log(err);
                    return res.render('postFull');
                }
                else{
                        // console.log(posts);
                        res.redirect("/fullpost/" + req.params.userid + "/" + req.params.postid);
                }
                });
            }
        });
        }
    });
});

app.get("/delete/:userid/:postid", isLoggedIn, function(req, res){
    Post.remove({
        _id: req.params.postid
    }, function (err, post) {
        if (err){
            res.send(err);
        }
        else {
            res.redirect("/profile/" + req.params.userid);
        }
    });
});

//SIGNUP
//show sign up form
app.get("/signup", function(req, res){
   res.render("signup"); 
});
//handling user sign up
app.post("/signup", function(req, res){
    User.register(new User({username: req.body.username, fullname: req.body.name, year: req.body.year, branch: req.body.branch, github: req.body.github}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('signup');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/profile/" + req.user._id);
        });
    });
});

var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./public/profileimages");
     },
     filename: function(req, file, callback) {
         callback(null,   req.user.username + ".jpg");
     }
 });
 
 var upload = multer({
     storage: Storage
 }).array("profileImg", 1); //Field name and max count

app.post("/profileimg", function(req, res){
        upload(req, res, function(err) {
         if (err) {
             return res.end("Something went wrong!");
         }
         return res.redirect("/profile/" + req.user._id);
     });
        
    });
    

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});

//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login"
}) ,function(req, res){
    res.redirect("/profile/" + req.user._id);
});

//LOGOUT
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // alert("You need to login first.");
    res.redirect("/login");
}


app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server has started!....👌");
});