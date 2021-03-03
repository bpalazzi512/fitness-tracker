const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose')
const User = require('./models/user')
require('dotenv').config()

passport.serializeUser(function(user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    /*
    Instead of user this function usually recives the id
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    User.findById(id, (err, user)=>{
      done(null, user)
    })

});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      /*
        User.findOrCreate({ googleId: profile.id}, (err, user)=>{
          return done(null, user)
        })
        */
        /*
         use the profile info (mainly profile id) to check if the user is registerd in ur db
         If yes select the user and pass him to the done callback
         If not create the user and then select him and pass to callback
        */
        User.findOne({googleId: profile.id}, (err, user)=>{
          if(err){
            return done(err)
          }
          if(!user){
            tempUser = new User({
              googleId: profile.id,
              fname: profile.name.givenName,
              lname: profile.name.familyName,
              email: profile.emails[0].value
            })
            tempUser.save((err)=>{
              if(err){
                return done(err)
              }else{
                return done(null, tempUser)
              }
            })
          }else{
            return done(null, user)
          }
        })
        console.log(profile.name.familyName)

    }
));
