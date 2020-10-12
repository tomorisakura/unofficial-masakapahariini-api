const express = require('express');
const route = express.Router();

const controller = require('../controller/index');

route.get('/api/recipes', controller.newRecipes);
route.get('/api/recipes/:page', controller.newRecipesByPage);
route.get('/api/categorys', controller.category);
route.get('/api/articles', controller.article);
route.get('/api/category/:key', controller.recipesByCategory);
route.get('/api/category/:key/:page', controller.recipesCategoryByPage);
route.get('/api/recipe/:key', controller.recipesDetail);

module.exports = route;
