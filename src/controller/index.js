const baseUrl = require('../constant/url');
const services = require('../helper/service');
const cheerio = require('cheerio');

const fetchRecipes = (req, res, response) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('._recipes-list');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('._recipe-card');
        element.find('._recipe-card .card').each((i, e) => {
            title = $(e).find('h3 a').attr('data-tracking-value');
            thumb = $(e).find('picture').find('img').attr('data-src');
            duration = $(e).find('._recipe-features a').text().trim().split('\n')[0].trim();
            difficulty = $(e).find('._recipe-features a[data-tracking]').text().replace('\n', '').trim();
            servings = $(e).find('.servings').find('small').text();
            url = $(e).find('h3 a').attr('href');
            console.log(url);
            href = url.split('/');
            key = href[4];

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
                times: duration,
                serving: servings,
                difficulty: difficulty
            });
        });
        console.log('fetch new recipes');
        res.send({
            method: req.method,
            status: true,
            results: recipe_list
        });
    } catch (error) {
        throw error;
    }
}

const fetchArticle = (req, res, response) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('._articles-list');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('._article-card');
        element.find('._article-card .card').each((i, e) => {
            title = $(e).find('h3 a').attr('data-tracking-value');
            thumb = $(e).find('picture').find('img').attr('data-src').trim();
            url = $(e).find('h3 a').attr('href'); 
            href = url.split('/');
            key = href[3] + "/" + href[4];

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
            });
        });
        console.log('fetch new recipes');
        res.send({
            method: req.method,
            status: true,
            results: recipe_list
        });
    } catch (error) {
        throw error;
    }
}

const limiterRecipes = (req, res, response, limiter) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('._recipes-list');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        // element.find('.category-posts');
        element.find('._recipe-card');
        element.find('._recipe-card .card').each((i, e) => {
            title = $(e).find('h3 a').attr('data-tracking-value');
            thumb = $(e).find('picture').find('img').attr('data-src');
            duration = $(e).find('._recipe-features a').text().trim().split('\n')[0].trim();
            difficulty = $(e).find('._recipe-features a[data-tracking]').text().replace('\n', '').trim();
            url = $(e).find('h3 a').attr('href');
            href = url.split('/');
            key = href[4];

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
                times: duration,
                serving: servings,
                difficulty: difficulty
            });

        });

        const recipes_limit = recipe_list.splice(0, limiter);
        console.log('limiter');
        if (limiter > 10) {
            res.send({
                method: req.method,
                status: false,
                message: 'oops , you fetch a exceeded of limit, please set a limit below of 10',
                results: null
            });
        } else {
            res.send({
                method: req.method,
                status: true,
                results: recipes_limit
            });
        }
    } catch (error) {
        throw error;
    }
}

const Controller = {
    newRecipes: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep/`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    newRecipesByPage: async (req, res) => {
        try {
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep/page/${page}`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    category: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`, res);
            const $ = cheerio.load(response.data);
            const element = $('#sidebar');
            let category, url, key;
            let category_list = [];
            element.find('.explore-by-widget');
            element.find('.category-col').each((i, e) => {
                // image = $(e).find('.bg-medium').

                category = $(e).find('a').attr('data-tracking-value');
                url = $(e).find('a').attr('href');
                const split = category.split(' ');
                if (split.includes('Menu')) split.splice(0, 1);
                const results = Array.from(split).join('-');
                key = $(e).find('a').attr('href').split('/');
                key = key[key.length - 2];
                category_list.push({
                    category: category,
                    url: url,
                    key: key
                });
            });

            return res.send({
                method: req.method,
                status: true,
                results: category_list
            });

        } catch (error) {
            throw error;
        }
    },

    article: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`, res);
            return fetchArticle(req, res, response)
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
                    title: title,
                    url: url,
                    key: parse[3]
                });
            });

            return res.send({
                method: req.method,
                status: true,
                results: article_lists
            });
        } catch (error) {
            throw error;
        }
    },

    recipesByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/${key}`, res);
            return fetchRecipes(req, res, response);

        } catch (error) {
            throw error;
        }
    },

    recipesCategoryByPage: async (req, res) => {
        try {
            const key = req.params.key;
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/${key}/?halaman=${page}`, res);
            return fetchRecipes(req, res, response);

        } catch (error) {
            throw error;
        }
    },

    recipesDetail: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep/${key}`, res);
            const $ = cheerio.load(response.data);
            let metaDuration, metaServings, metaDificulty, metaIngredient;
            let title, thumb, user, datePublished, desc, quantity, ingredient, ingredients, time;
            let parseDuration, parseServings, parseDificulty, parseIngredient;
            let duration, servings, difficulty;
            let servingsArr = [];
            let difficultyArr = [];
            let object = {};
            const elementHeader = $('._recipe-header');
            const elementDesc = $('._rich-content').first();
            const elementNeeded = $('._product-popup');
            const elementIngredients = $('div._recipe-ingredients');
            const elementTutorial = $('._recipe-steps');
            title = elementHeader.find('header h1').text().replace('\n', '').trim();
            thumb = elementHeader.find('picture .image').attr('data-src');
            if (thumb === undefined) {
                thumb = null;
            }
            user = elementHeader.children().last().find('.author').text().split('|');
            datePublished = user[1].trim(); // <= time
            user = user[0].trim(); // <= author
            
            servings = elementHeader.find('._kritique-rate div').attr('style');
            duration = elementHeader.find('._recipe-features').find('a:not([data-tracking])').text().trim();
            difficulty = elementHeader.find('._recipe-features a[data-tracking]').text().trim()

            object.title = title;
            object.thumb = thumb;
            object.servings = servings;
            object.times = duration;
            object.difficulty = difficulty;
            object.author = { user, datePublished };
            
            elementDesc.each((i, e) => {
                desc = $(e).find('p').text();
                object.desc = desc;
            });

            let thumb_item, need_item;
            let neededArr = [];
            elementNeeded.find('._product-card').each((i, e) => {
                thumb_item = $(e).find('picture.thumbnail').find('img').attr('data-src');
                need_item = $(e).find('div.title').text().replace(/\t/g, '');
                neededArr.push({
                    item_name: need_item.replace('\n', ''),
                    thumb_item: thumb_item
                });
            });

            object.needItem = neededArr;

            let ingredientsArr = [];
            elementIngredients.find('.d-flex').each((i, e) => {
                let term = '';
                quantity = $(e).find('.part').text().trim();
                metaIngredient = $(e).find('.item').text().trim().split('\r\t')[0];
                metaIngredient = metaIngredient.split('\t');
                if (metaIngredient[0] != '') {
                    term = metaIngredient[0].replace('\n', '').trim() + ' '
                        + metaIngredient[metaIngredient.length - 1].replace('\n', '').trim();
                    ingredients = `${quantity} ${term}`;
                    ingredientsArr.push(ingredients)
                }
            });

            object.ingredient = ingredientsArr;
            let step, resultStep;
            let stepArr = [];
            elementTutorial.find('.step').each((i, e) => {
                step = $(e).find('span.TextRun').text();
                resultStep = `${i + 1}. ${step}`
                console.log(resultStep);
                stepArr.push(resultStep);
            });

            object.step = stepArr;

            res.send({
                method: req.method,
                status: true,
                results: object
            });

        } catch (error) {
            throw error;
        }
    },

    searchRecipes: async (req, res) => {
        try {
            const query = req.query.s;
            console.log(query);
            const response = await services.fetchService(`${baseUrl}/?s=${query}`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    articleCategory: async (req, res) => {
        try {
            const response = await services.fetchService(baseUrl, res);
            const $ = cheerio.load(response.data);

            const element = $('#menu-item-286');
            let title, key;
            let article_category_list = [];
            element.find('.sub-menu').find('.menu-item').each((i, e) => {
                title = $(e).find('a').text();
                key = $(e).find('a').attr('href').split('/');
                article_category_list.push({
                    title: title,
                    key: key[3]
                })
            });

            res.send({
                method: req.method,
                status: true,
                results: article_category_list
            });

        } catch (error) {
            throw error;
        }
    },

    articleByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/${key}`, res);

            const $ = cheerio.load(response.data);
            const element = $('#category-content');
            let title, thumb, tags, keys;
            let article_list = [];
            element.find('.category-posts').find('.post-col').each((i, e) => {
                title = $(e).find('.inner-block').find('a').attr('data-tracking-value');
                thumb = $(e).find('.inner-block').find('a').find('.thumb-wrapper').find('img').attr('data-lazy-src');
                tags = $(e).find('.post-info').find('small').text();
                keys = $(e).find('.inner-block').find('a').attr('href').split('/')
                article_list.push({
                    title: title,
                    thumb: thumb,
                    tags: tags,
                    key: keys[4]
                });
            });

            res.send({
                method: req.method,
                status: true,
                results: article_list
            });

        } catch (error) {
            throw error;
        }
    },

    articleDetails: async (req, res) => {
        try {
            const tag = req.params.tag;
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/${tag}/${key}`, res);

            const $ = cheerio.load(response.data);
            const element = $('.content');

            let title, thumbs, author, published, description;
            let article_object = {};
            title = element.find('._article-header').find('.title').text();
            author = element.find('.info').find('.author').text().split('|');
            published = author[1].trim();
            author = author[0].trim();
            thumbs = element.find('picture.thumbnail').find('img').attr('data-src');

            element.find('._rich-content').each((i, e) => {
                description = $(e).find('p').text();
            });

            article_object.title = title.trim();
            article_object.thumb = thumbs.trim();
            article_object.author = author;
            article_object.date_published = published;
            article_object.description = description;

            res.send({
                method: req.method,
                status: true,
                results: article_object
            });

        } catch (error) {
            throw error;
        }
    },

    newRecipesLimit: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/resep/`, res);
            const limit = req.query.limit;
            return limiterRecipes(req, res, response, limit);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller;