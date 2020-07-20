const express = require("express");
const mongoose = require("mongoose");
const { response } = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("../models/User");
const User = mongoose.model("users");

router.get("/register", (require, response) => {
    response.render("user/register/index");
});

router.post("/register", (require, response) => {
    var error = [];

    if(!require.body.name || typeof require.body.name == undefined || require.body.name == null){
        error.push({
            text: "Nome inválido!",
        });
    }

    if(!require.body.email || typeof require.body.email == undefined || require.body.email == null){
        error.push({
            text: "Email inválido!",
        });
    }

    if(!require.body.pass || typeof require.body.pass == undefined || require.body.pass == null){
        error.push({
            text: "Senha inválida!",
        });
    }

    if(require.body.pass.length < 4){
        error.push({
            text: "Senha muito curta!",
        });
    }

    if(require.body.pass !== require.body.pass_confirm){
        error.push({
            text: "As senhas não são iguais!",
        });
    }

    if(error.length > 0){
        response.render("user/register/index", {error: error});
    }else{
        User.findOne({email: require.body.email}).lean().then((user) => {
            if(user){
                require.flash("error_msg", "Já há um cadastro com esse email!");
                response.redirect("/user/register");
            }else{
                const newUser = new User({
                    name: require.body.name,
                    email: require.body.email,
                    pass: require.body.pass
                });

                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.pass, salt, (error, hash) => {
                        if(error){
                            require.flash("error_msg", "Houve um erro ao salvar o usuário!");
                            response.redirect("/");
                        }

                        newUser.pass = hash;

                        newUser.save().then(() => {
                            require.flash("success_msg", "Usuário cadastrado com sucesso!");
                            response.redirect("/");
                        }).catch((error) => {
                            require.flash("error_msg", "Houve um erro ao criar o usuário! Favor tente novamente");
                        });
                    });
                });
            }
        }).catch((error) => {
            require.flash("error_msg", "Houve um erro interno!");
            response.redirect("/");
        });
    }
});

router.get("/login", (require, response) => {
    response.render("user/login/index");
});

router.post("/login", (require, response, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/user/login",
        failureFlash: true
    })(require, response, next);
});

router.get("/logout", (require, response) => {
    require.logout();
    require.flash("success_msg", "Encerramento de login efetuado com sucesso!");
    response.redirect("/");
})

module.exports = router;