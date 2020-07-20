const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const moment = require("moment");
const app = express();
const mongoose = require("./config/connection");
const admin = require("./routes/admin");
const user = require("./routes/user");
const { response } = require("express");
const passport = require("passport");
require("./models/Post");
require("./models/Category");
require("./config/auth")(passport);
const Post = mongoose.model("posts");
const Category = mongoose.model("categorys");

const PORT = 3333;

app.use(session({
    secret: "bloghash",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((require, response, next) => {
    response.locals.success_msg = require.flash("success_msg");
    response.locals.error_msg = require.flash("error_msg");
    response.locals.error = require.flash('error');
    response.locals.user = require.user || null;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars({defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return moment(date).locale('pt-br').format('dddd - DD MMMM YYYY - HH:MM:ss');
        }
    }
}));

app.set('view engine', 'handlebars');

app.use("/admin", admin);

app.use("/user", user);

app.get("/post/:slug", (require, response) => {
    Post.findOne({slug: require.params.slug}).lean().then((post) => {
        if(post){
            response.render("client/post/index", {post: post});
        }else{
            require.flash("error_msg", "Está postagem não existe!");
            response.redirect("/");
        }
    }).catch((error) => {
        require.flash("errror_msg", "Houve um erro interno!");
        response.redirect("/");
    });
});

app.get("/categorys", (require, response) => {
    Category.find().lean().then((categorys) => {
        response.render("client/categorys/index", {categorys: categorys});
    }).catch((error) => {
        require.flash("error_msg", "Houve um erro interno ao lista as categorias!");
        response.redirect("/");
    });
});

app.get("/categorys/:slug", (require, response) => {
    Category.findOne({slug: require.params.slug}).lean().then((categorys) => {
        if(categorys){
            Post.find({category: categorys._id}).lean().then((posts) => {
                response.render("client/posts/index", {posts: posts, categorys: categorys});
            }).catch((error) => {
                require.flash("error_msg", "Houve um erro ao listar as postagens!");
                response.redirect("/");
            });
        }else{
            require.flash("error_msg", "Esta categoria não existe!");
            response.redirect("/");
        }
    }).catch((error) => {
        require.flash("error_msg", "Houve um error interno ao carregar a página desta categoria!");
        response.redirect("/");
    });
});

app.get("/404", (require, response) => {
    response.render("erros/404/index");
});

app.get("/", (require, response) => {
    Post.find().lean().populate("category").sort({date: "DESC"}).then((posts) => {
        response.render("client/home/index", {posts: posts});
    }).catch((error) => {
        require.flash("error_msg", "Houve um erro interno!");
        response.redirect("/404");
    });
});

app.listen(PORT, () => {
    console.log('Aplication was started...');
});