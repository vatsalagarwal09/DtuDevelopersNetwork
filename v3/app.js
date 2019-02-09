var express                =  require("express"),
    mongoose               =  require("mongoose"),
    passport               =  require("passport"),
    User                   =  require("./models/user"),
    bodyParser             =  require("body-parser"),
    LocalStrategy          =  require("passport-local"),
    passportLocalMongoose  =  require("passport-local-mongoose"),
    formidable             =  require('formidable'),
    http                   =  require('http'),
    fs                     =  require('fs');

    
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
   res.render("home", {currentUser: req.user}); 
});

//addpost route
app.get("/addpost",function(req,res){
   res.render("addpost", {currentUser: req.user}); 
});

//users route
app.get("/users",function(req,res){
   res.render("users", {currentUser: req.user}); 
});

//about route
app.get("/about",function(req,res){
   res.render("about", {currentUser: req.user}); 
});

// //profile route
// app.get("/profile", isLoggedIn, function(req, res){
//     res.render("profile",{currentUser: req.user});
// });

app.get("/profile/:id",isLoggedIn, function(req, res){
    //find the user with provided ID
    User.findById(req.params.id).exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            console.log(foundUser);
            //render show template with that campground
            res.render("profile", {user: foundUser, currentUser: req.user});
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

app.put("/profileimg/:id", function(req, res){
        	User.findByIdAndUpdate({_id: req.params.id},
	                   {
			   	          img: req.body.profileImg
			   	          
			           }, function(err, docs){
			 	                if(err) res.json(err);
			                	else    
			                	    console.log(req.user.img);
			                	    res.redirect("/profile/" + req.params.id);
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
    res.redirect("/login");
}


app.listen(process.env.PORT,process.env.IP,function(){
   console.log("Server has started!....👌");
});