const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
require("../models/Category");
require("../models/Post");
const Category = mongoose.model("categorys");
const Post = mongoose.model("posts");
const {admin} = require("../helpers/admin");

router.get("/", admin, (require, response) => {
    response.render("admin/home/index");
});

router.get("/category", admin, (require, response) => {0
    Category.find().lean().sort({date: 'DESC'}).then((categorys) => {
        response.render("admin/category/index", {categorys: categorys});
    }).catch((error) => {
        require.flash("error_msg", "Houve um erro ao listar as categorias!");
        response.redirect("/admin");
    });
});

router.get("/category/register", admin, (require, response) => {
    response.render("admin/register/category/index");
});

router.post("/category/register/new", admin, (require, response) => {
    var errors = [];

    if(!require.body.name || typeof require.body.name == undefined || require.body.name == null){
        errors.push({
            text: "Nome inválido!",
        });
    }

    if(!require.body.slug || typeof require.body.slug == undefined || require.body.slug == null){
        errors.push({
            text: "Slung inválido!",
        });
    }

    if(require.body.name.length < 2){
        errors.push({
            text: "Nome da categoria com no mínimo 2 caracteres!",
        });
    }

    if(errors.length > 0){
        response.render("admin/register/category/index", {errors: errors});
    }else{
        const newCategory = {
            name: require.body.name,
            slug: require.body.slug
        };
    
        new Category(newCategory).save().then(() => {
            require.flash("success_msg", "Nova categoria adicionada com sucesso!");
            response.redirect("/admin/category");
        }).catch((error) => {
            require.flash("error_msg", "Houve um erro no cadastro da nova categoria! Favor tente novamente!");
            response.redirect("/admin");
        });
    }
});

router.get("/category/edit/:id", admin, (require, response) => {
    Category.findOne({_id: require.params.id}).lean().then((category) => {
        response.render("admin/edit/category/index", {category: category});
    }).catch((error) => {
        require.flash("error_msg", "Esta categoria não foi encontrada!");
        response.redirect("/admin/category");
    });
});

router.post("/category/update", admin, (require, response) => {
    var errors = [];

    if(!require.body.name || typeof require.body.name == undefined || require.body.name == null){
        require.flash("error_msg", "Nome inválido!");
    }

    if(!require.body.slug || typeof require.body.slug == undefined || require.body.slug == null){
        require.flash("error_msg", "Slung inválido!");
    }

    if(require.body.name.length < 2){
        require.flash("error_msg", "Nome da categoria com no mínimo 2 caracteres!");
    }

    if(errors.length > 0){
        response.redirect("/admin/category");
    }else{
        Category.findOne({_id: require.body.id}).then((category) => {
            category.name = require.body.name;
            category.slug = require.body.slug;

            category.save().then(() => {
                require.flash("success_msg", "Categoria atualizada com sucesso!");
                response.redirect("/admin/category");
            }).catch((error) => {
                require.flash("error_msg", "Erro interno ao salvar a atualização da categoria!");
                response.redirect("/admin/category");
            });
        }).catch((error) => {
            require.flash("error_msg", "Erro ao atualizar a categoria!");
            response.redirect("/admin/category");
        });
    }
});

router.post("/category/delete", admin, (require, response) => {
    Category.remove({_id: require.body.id}).then(() => {
        require.flash("success_msg", "Categoria removida com sucesso!");
        response.redirect("/admin/category");
    }).catch((error) => {
        require.flash("error_msg", "Erro ao remover a categoria!");
        response.redirect("/admin/category");
    });
});

router.get("/posts", admin, (require, response) => {
    Post.find().lean().populate("category").sort({date: "DESC"}).then((posts) => {
        response.render("admin/post/index", {posts: posts});
    }).catch((error) => {
        require.flash("error_msg", "Erro ao listar as postagens!");
        response.redirect("/admin");
    });
});

router.get("/posts/register", admin, (require, response) => {
    Category.find().lean().then((categorys) => {
        response.render("admin/register/post/index", {categorys: categorys});
    }).catch((error) => {
        require.flash("error_msg", "Erro ao exibir o formulário!");
        response.redirect("/admin");
    });
});

router.post("/posts/register/new", admin, (require, response) => {
    var errors = [];

    if(!require.body.title || typeof require.body.title == undefined || require.body.title == null){
        errors.push({
            text: "Título inválido!",
        });
    }

    if(!require.body.slug || typeof require.body.slug == undefined || require.body.slug == null){
        errors.push({
            text: "Slung inválido!",
        });
    }

    if(!require.body.description || typeof require.body.description == undefined || require.body.description == null){
        errors.push({
            text: "Descrição inválida!",
        });
    }

    if(!require.body.content || typeof require.body.content == undefined || require.body.content == null){
        errors.push({
            text: "Conteúdo inválido!",
        });
    }

    if(require.body.title.length < 4){
        errors.push({
            text: "Títutlo da categoria com no mínimo 4 caracteres!",
        });
    }

    if(require.body.content.length < 10){
        errors.push({
            text: "Conteúdo da categoria com no mínimo 10 caracteres!",
        });
    }

    if(require.body.category == "0"){
        errors.push({
            text: "Categoria inválida! Favor registre ao menos uma categoria!",
        });
    }

    if(errors.length > 0){
        response.render("admin/register/post/index", {errors: errors});
    }else{
        const newPost = {
            title: require.body.title,
            slug: require.body.slug,
            description: require.body.description,
            content: require.body.content,
            category: require.body.category,
            date: Date.now()
        };

        new Post(newPost).save().then(() => {
            require.flash("success_msg", "Sucesso ao cadastrar a postagem!");
            response.redirect("/admin/posts");
        }).catch((error) => {
            require.flash("error_msg", "Erro ao cadastrar a postagem!");
            response.redirect("/admin/posts");
        });
    }
});

router.get("/posts/edit/:id", admin, (require, response) => {
    Post.findOne({_id: require.params.id}).lean().then((post) => {
        Category.find().lean().then((categorys) => {
            response.render("admin/edit/post/index", {post: post, categorys: categorys});
        }).catch((error) => {
            require.flash("error_msg", "Erro ao listar as categorias!");
            response.redirect("/admin/posts");
        });
    }).catch((error) => {
        require.flash("error_msg", "Erro ao carregar o ambiente de edição!");
        response.redirect("/admin/posts");
    });
});

router.post("/posts/update", admin, (require, response) => {
    var errors = [];

    if(!require.body.title || typeof require.body.title == undefined || require.body.title == null){
        require.flash("error_msg", "Título inválido!");
    }

    if(!require.body.slug || typeof require.body.slug == undefined || require.body.slug == null){
        require.flash("error_msg", "Slung inválido!");
    }

    if(!require.body.description || typeof require.body.description == undefined || require.body.description == null){
        require.flash("error_msg", "Descrição inválida!");
    }

    if(!require.body.content || typeof require.body.content == undefined || require.body.content == null){
        require.flash("error_msg", "Conteúdo inválido!");
    }

    if(require.body.title.length < 4){
        require.flash("error_msg", "Títutlo da postagem com no mínimo 4 caracteres!");
    }

    if(require.body.content.length < 10){
        require.flash("error_msg", "Conteúdo da postagem com no mínimo 10 caracteres!");
    }

    if(require.body.category == "0"){
        require.flash("error_msg", "Categoria inválida! Favor registre ao menos uma categoria!");
    }

    if(errors.length > 0){
        response.render("admin/edit/post/index", {errors: errors});
    }else{
        Post.findOne({_id: require.body.id}).then((post) => {
            post.title = require.body.title;
            post.slug = require.body.slug;
            post.description = require.body.description;
            post.content = require.body.content;
            post.category = require.body.category;

            post.save().then(() => {
                require.flash("success_msg", "Postagem editada com sucesso!");
                response.redirect("/admin/posts");
            }).catch((error) => {
                require.flash("error_msg", "Erro interno ao atualizar a postagem!");
                response.redirect("/admin/posts");
            });
        }).catch((error) => {
            require.flash("error_msg", "Erro ao atualizar a postagem!");
            response.redirect("/admin/posts");
        });
    }
});

router.post("/posts/delete", admin, (require, response) => {
    Post.remove({_id: require.body.id}).then(() => {
        require.flash("success_msg", "Postagem removida com sucesso!");
        response.redirect("/admin/posts");
    }).catch((error) => {
        require.flash("error_msg", "Erro ao remover a postagem!");
        response.redirect("/admin/posts");
    });
});

module.exports = router;