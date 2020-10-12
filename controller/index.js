const baseUrl = require('../constant/url');
const services = require('../helper/service');
const cheerio = require('cheerio');
const { use } = require('../route');

const fetchRecipes = (req, res, response) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('#category-content');
        let title, thumb, duration, servings, dificulty, key, url, href;
        let recipe_list = [];
        element.find('.category-posts');
        element.find('.post-col').each((i, e) => {
            title = $(e).find('a').attr('data-tracking-value');
            thumb = $(e).find('.thumb-wrapper').find('img').attr('data-lazy-src');
            duration = $(e).find('.time').find('small').text();
            servings = $(e).find('.servings').find('small').text();
            dificulty = $(e).find('.difficulty').find('small').text();
            url = $(e).find('a').attr('href');
            href = url.split('/');
            key = href[4];

            recipe_list.push({
                title : title,
                thumb : thumb,
                key : key,
                times : duration,
                portion : servings,
                dificulty : dificulty
            });
        });
        res.send({
            method : req.method,
            status : true,
            results : recipe_list
        });
    } catch (error) {
        throw error;
    }
}

const Controller = {
    newRecipes : async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    newRecipesByPage : async (req, res) => {
        try {
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/?halaman=${page}`);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    category : async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`);
            const $ = cheerio.load(response.data);
            const element = $('#sidebar');
            let category, url, key;
            let category_list = [];
            element.find('.explore-by-widget');
            element.find('.category-col').each((i, e) => {
                category = $(e).find('a').attr('data-tracking-value');
                url = $(e).find('a').attr('href');
                const split = category.split(' ');
                if (split.includes('Menu')) split.splice(0, 1);
                const results = Array.from(split).join('-');
                key = results.toLowerCase();
                category_list.push({
                    category : category,
                    url : url,
                    key : key
                });
            });

            return res.send({
                method : req.method,
                status : true,
                results : category_list
            });

        } catch (error) {
            throw error;
        }
    },

    article : async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`);
            const $ = cheerio.load(response.data);
            const element = $('.latest-posts-widget');
            let parse;
            let title, url;
            let article_lists = [];
            element.find('.posts-row');
            element.find('.posts-col').each((i, e) => {
                title = $(e).find('a').attr('data-tracking-value');
                url = $(e).find('a').attr('href');
                parse = url.split('/');
                console.log(parse.length);
                article_lists.push({
                    title : title,
                    url : url,
                    key : parse[3]
                });
            });

            return res.send({
                method : req.method,
                status : true,
                results : article_lists
            });
        } catch (error) {
            throw error;
        }
    },

    recipesByCategory : async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/${key}`);
            return fetchRecipes(req, res, response);

        } catch (error) {
            throw error;
        }
    },

    recipesCategoryByPage : async (req, res) => {
        try {
            const key = req.params.key;
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/${key}/?halaman=${page}`);
            return fetchRecipes(req, res, response);
            
        } catch (error) {
            throw error;
        }
    },

    recipesDetail : async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep/${key}`);
            const $ = cheerio.load(response.data);
            let metaDuration, metaServings, metaDificulty;
            let title , thumb, user, datePublished, desc;
            let parseDuration, parseServings, parseDificulty;
            let duration, servings, dificulty;
            let servingsArr = [];
            let difficultyArr = [];
            let detail_list = [];
            const elementHeader = $('#recipe-header');
            const elementDesc = $('.the-content').first();
            title = elementHeader.find('.title').text();
            thumb = elementHeader.find('.featured-img').attr('data-lazy-src');
            user = elementHeader.find('small.meta').find('.author').text();
            datePublished = elementHeader.find('small.meta').find('.date').text();

            elementHeader.find('.recipe-info').each((i, e) => {
                metaDuration = $(e).find('.time').find('small').text();
                parseDuration = metaDuration.split('\n')[1].split(' ');
                parseDuration.forEach( r => {
                    if(r !== "") duration = r;
                });
                metaServings = $(e).find('.servings').find('small').text();
                parseServings = metaServings.split('\n')[1].split(' ');
                parseServings.forEach(r => {
                    if(r !== "") servingsArr.push(r);
                });
                servings = Array.from(servingsArr).join(' ');
                metaDificulty = $(e).find('.difficulty').find('small').text();
                parseDificulty = metaDificulty.split('\n')[1].split(' ');
                parseDificulty.forEach(r => {
                    if(r !== "") difficultyArr.push(r);
                });
                dificulty = Array.from(difficultyArr).join(' ');
                detail_list.push({
                    title : title,
                    thumb : thumb,
                    servings : servings,
                    time : duration,
                    dificulty : dificulty,
                    user : {
                        name : user,
                        published : datePublished
                    }
                });
            });

            elementDesc.each((i, e) => {
                desc = $(e).find('p').text();
                detail_list.push({ desc : desc });
            });
            res.send(detail_list);

        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller;