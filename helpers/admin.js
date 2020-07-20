module.exports = {
    admin: function(require, response, next){
        if(require.isAuthenticated() && require.user.admin === true){
            return next();
        }

        require.flash("error_msg", "Você precisa ser um administrador!");
        response.redirect("/");
    }
}