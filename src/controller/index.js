const baseUrl = require('../constant/url');
const services = require('../helper/service');
const cheerio = require('cheerio');

const fetchRecipes = (req, res, response) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('#category-content');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('.category-posts');
        element.find('.post-col').each((i, e) => {
            title = $(e).find('.block-link').attr('data-tracking-value');
            thumb = $(e).find('.thumb-wrapper').find('img').attr('data-lazy-src');
            duration = $(e).find('.time').find('small').text();
            servings = $(e).find('.servings').find('small').text();
            difficulty = $(e).find('.difficulty').find('small').text();
            url = $(e).find('a').attr('href');
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

const limiterRecipes = (req, res, response, limiter) => {
    try {
        const $ = cheerio.load(response.data);
        const element = $('#category-content');
        let title, thumb, duration, servings, difficulty, key, url, href;
        let recipe_list = [];
        element.find('.category-posts');

        element.find('.post-col').each((i, e) => {
            title = $(e).find('.block-link').attr('data-tracking-value');
            thumb = $(e).find('.thumb-wrapper').find('img').attr('data-lazy-src');
            duration = $(e).find('.time').find('small').text();
            servings = $(e).find('.servings').find('small').text();
            difficulty = $(e).find('.difficulty').find('small').text();
            url = $(e).find('a').attr('href');
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
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    newRecipesByPage: async (req, res) => {
        try {
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep-masakan/?halaman=${page}`, res);
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
            let title, thumb, user, datePublished, desc, quantity, ingredient, ingredients;
            let parseDuration, parseServings, parseDificulty, parseIngredient;
            let duration, servings, difficulty;
            let servingsArr = [];
            let difficultyArr = [];
            let object = {};
            const elementHeader = $('#recipe-header');
            const elementDesc = $('.the-content').first();
            const elementNeeded = $('.needed-products');
            const elementIngredients = $('#ingredients-section');
            const elementTutorial = $('#steps-section');
            title = elementHeader.find('.title').text();
            thumb = elementHeader.find('.featured-img').attr('data-lazy-src');
            if (thumb === undefined) {
                thumb = null;
            }
            user = elementHeader.find('small.meta').find('.author').text();
            datePublished = elementHeader.find('small.meta').find('.date').text();

            elementHeader.find('.recipe-info').each((i, e) => {
                metaDuration = $(e).find('.time').find('small').text();
                metaServings = $(e).find('.servings').find('small').text();
                metaDificulty = $(e).find('.difficulty').find('small').text();
                if (metaDuration.includes('\n') && metaServings.includes('\n') && metaDificulty.includes('\n')) {
                    parseDuration = metaDuration.split('\n')[1].split(' ');
                    parseDuration.forEach(r => {
                        if (r !== "") duration = r;
                    });

                    parseServings = metaServings.split('\n')[1].split(' ');
                    parseServings.forEach(r => {
                        if (r !== "") servingsArr.push(r);
                    });
                    servings = Array.from(servingsArr).join(' ');
                    parseDificulty = metaDificulty.split('\n')[1].split(' ');
                    parseDificulty.forEach(r => {
                        if (r !== "") difficultyArr.push(r);
                    });
                    difficulty = Array.from(difficultyArr).join(' ');
                }

                object.title = title;
                object.thumb = thumb;
                object.servings = servings;
                object.times = duration;
                object.difficulty = difficulty;
                object.author = { user, datePublished };
            });

            elementDesc.each((i, e) => {
                desc = $(e).find('p').text();
                object.desc = desc;
            });

            let thumb_item, need_item;
            let neededArr = [];
            elementNeeded.find('.d-inline-flex').find('.justify-content-around').each((i, e) => {
                thumb_item = $(e).find('.product-img').find('img').attr('data-lazy-src');
                need_item = $(e).find('.product-info').find('.product-name').text();
                neededArr.push({
                    item_name: need_item,
                    thumb_item: thumb_item
                });
            });

            object.needItem = neededArr;

            let ingredientsArr = [];
            elementIngredients.find('.ingredient-groups').find('.ingredients').find('.ingredient-item').each((i, e) => {
                const term = [];
                quantity = $(e).find('.quantity').text();
                metaIngredient = $(e).find('.ingredient').text();
                parseIngredient = metaIngredient.split('\n')[1].split(' ');
                parseIngredient.forEach(r => {
                    if (r !== "") term.push(r);
                });
                ingredient = Array.from(term).join(' ');
                ingredients = `${quantity} ${ingredient}`
                ingredientsArr.push(ingredients)
            });

            object.ingredient = ingredientsArr;
            let step, resultStep;
            let stepArr = [];
            elementTutorial.find('.steps').find('.step').each((i, e) => {
                step = $(e).find('.step-description').find('p').text();
                resultStep = `${i + 1} ${step}`
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
            const query = req.query.q;
            console.log(query);
            const response = await services.fetchService(`${baseUrl}/?s=${query}`, res);
            const $ = cheerio.load(response.data);
            const element = $('#search-content');

            let title, url, key, thumb, duration, serving, difficulty;
            let search_list = [];
            element.find('.results-row').find('.post-col').each((i, e) => {
                title = $(e).find('.block-link').attr('data-tracking-value');
                url = $(e).find('a').attr('href').split('/');
                thumb = $(e).find('.thumb-wrapper').find('img').last().attr('data-lazy-src');
                key = url[4];
                duration = $(e).find('.recipe-info').find('.time').find('small').text();
                serving = $(e).find('.recipe-info').find('.servings').find('small').text();
                difficulty = $(e).find('.recipe-info').find('.difficulty').find('small').text();

                search_list.push({
                    title: title,
                    thumb: thumb,
                    key: key,
                    times: duration,
                    serving: serving,
                    difficulty: difficulty,
                });
            });

            const item = search_list.filter(result => result.times !== "");

            res.send({
                method: req.method,
                status: true,
                results: item
            });

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
            const element = $('#main');

            let title, thumbs, author, published, description;
            let article_object = {};
            title = element.find('.article-header').find('.title').text();
            author = element.find('small').find('.author').text();
            published = element.find('small').find('.date').text();
            thumbs = element.find('.featured-img-wrapper').find('img').attr('data-lazy-src');

            element.find('.the-content').each((i, e) => {
                description = $(e).find('p').text();
            });

            article_object.title = title;
            article_object.thumb = thumbs;
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
            const response = await services.fetchService(`${baseUrl}/resep-masakan/`, res);
            const limit = req.query.limit;
            return limiterRecipes(req, res, response, limit);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Controller;