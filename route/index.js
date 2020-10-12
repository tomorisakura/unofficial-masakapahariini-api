const express = require('express');
const route = express.Router();

const controller = require('../controller/index');

route.get('/', (req, res) => {
    res.send('Hello there 👋');
});

route.get('/api', (req, res) => {
    res.send({
        method : req.method,
        message : 'Hello there 🌹',
        status : 'On Progress',
        lets_connected : {
            github : 'https://github.com/tomorisakura',
            dribbble : 'https://dribbble.com/grevimsx',
            deviantart : 'https://deviantart.com/hakureix'
        }
    });
});

route.get('/api/recipes', controller.newRecipes);
route.get('/api/recipes/:page', controller.newRecipesByPage);
route.get('/api/categorys', controller.category);
route.get('/api/articles', controller.article);
route.get('/api/category/:key', controller.recipesByCategory);
route.get('/api/category/:key/:page', controller.recipesCategoryByPage);
route.get('/api/recipe/:key', controller.recipesDetail);

route.get('*', (req, res) => {
    res.status(404).json({
        method : req.method,
        message : 'cant find spesific url',
        status : false
    });
});

module.exports = route;
