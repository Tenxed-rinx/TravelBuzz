
const User = require("../models/user.js")

module.exports.usersignupForm = (req,res)=>{
    res.render("../views/users/signupform.ejs");
}

module.exports.usersignUp = async (req,res)=>{
    try{
let{username,email,password}=req.body.user;
    let user1 = new User({
        username,
        email
    });
    const registereduser = await User.register(user1,password);
    let redirectUrl = req.session.redirectUrl|| "/listings";
    req.login(registereduser,(err)=>{
        if(err) return next(err);
        req.flash("success","New User Registered and Logged In");
        res.redirect(redirectUrl);
    })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/user/signup");
    }
}

module.exports.userloginForm = (req,res)=>{
    res.render("../views/users/loginform.ejs")
}

module.exports.userlogIn = (req,res)=>{
    req.flash("success","Logged in successfully");
    let redirectUrl = res.locals.savedOriginalurl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.userlogOut = (req,res)=>{
    if(req.isAuthenticated()){
    req.logout(err=>{
        if(err) return next(err);
        req.flash("success","You Logged out");
        res.redirect("/listings");
    })
    }
    else {res.redirect("/listings")};
}