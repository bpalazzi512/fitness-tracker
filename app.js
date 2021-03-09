const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const passport  = require('passport')
const cookieSession = require('cookie-session')
require("./passport-setup")
const User = require('./models/user')
const mongoose = require('mongoose')
require('dotenv').config()
const ejs = require('ejs')


//connect to mongodb
const dbURI = process.env.DB_URI;
 

//options in second argument prevent deprecation errors
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result) =>{
    console.log("connected to DB") 
})
.catch((err)=>{console.log(err)})

//middleware
app.set('views', __dirname + '/views');
app.set('view engine', "ejs")
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieSession({
    name: "tuto-session",
    keys: ['key1', 'key2']
}))

//initializes things for passport
app.use(passport.initialize())
app.use(passport.session())

//checks if user is logged in
const isLoggedIn = (req, res, next)=>{
    if(req.user){
        next()
    }else{
        res.sendStatus(401)
    }
}

//route to test if something is protected
app.get("/protected", isLoggedIn, (req, res)=>{
    console.log(req.user)
    res.send("ur logged in")

})



//home route
app.get("/", (req, res) =>{
    res.render('home', {user: req.user})
})

//route to main dashboard
app.get("/dashboard", isLoggedIn, (req, res)=>{
    res.render('dashboard', {user: req.user})
})

app.get("/login",  (req, res)=>{
    res.render('login')
})

//route to go if auth fails
app.get("/failed", ((req, res) => {
    res.send("failed to auth")
}))

//route to go if auth successful
app.get("/success", ((req, res) => {
    res.send("auth successful")
}))

//route to auth
app.get('/google',
    passport.authenticate('google', { scope:
            [ 'email', 'profile' ] }
    ));


//callback auth
app.get( '/google/callback',
    passport.authenticate( 'google', {
        failureRedirect: '/failed',
        successRedirect: '/'
    })
);


//logs user out
app.get("/logout", (req, res)=>{
    req.session = null
    req.logout()
    res.redirect("/")
})

const port = 3000 || process.env.PORT

//creates server
app.listen(port, ()=>{
    console.log("Listening on Port 3000")
})
