const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { response } = require("express");
require("../models/User");
const User = mongoose.model("users");

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: "pass"}, (email, pass, done) => {
        User.findOne({email: email}).lean().then((user) => {
            if(!user){
                return done(null, false, {message: "Está conta não está cadastrada!"});
            }

            bcrypt.compare(pass, user.pass, (error, batem) => {
                if(batem){
                    return done(null, user);
                }else{
                    return done(null, false, {message: "Senha incorreta!"});
                }
            });
        }).catch((error) => {
            require.false("error_msg", "Houve um erro inesperado! Favor tente novamente!");
            response.redirect("/");
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user);
        });
    })
}