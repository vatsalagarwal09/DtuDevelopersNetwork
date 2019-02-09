var express                =  require("express"),
    mongoose               =  require("mongoose"),
    passport               =  require("passport"),
    User                   =  require("./models/user"),
    bodyParser             =  require("body-parser"),
    LocalStrategy          =  require("passport-local"),
    passportLocalMongoose  =  require("passport-local-mongoose");
    
var app = express();

mongoose.connect("mongodb://localhost:27017/devnetDB", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    secret: "hiii",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

app.get("/",function(req,res){
   res.render("home"); 
});

app.get("/users",function(req,res){
   res.render("users"); 
});

app.get("/about",function(req,res){
   res.render("about"); 
});

app.get("/profile", isLoggedIn, function(req, res){
    res.render("profile");
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
           res.redirect("/profile");
        });
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
    successRedirect: "/profile",
    failureRedirect: "/login"
}) ,function(req, res){
});

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