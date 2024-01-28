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
            difficulty = $(e).find('._recipe-features a[data-tracking]').last().text().replace('\n', '').trim();
            kkal = $(e).find('._recipe-features a.icon_fire').text().trim("");
            servings = $(e).find('.servings').find('small').text();
            url = $(e).find('h3 a').attr('href');
            
            href = url.split('/');
            key = href[4];

            recipe_list.push({
                title: title,
                thumb: thumb,
                key: key,
                times: duration,
                serving: servings,
                difficulty: difficulty,
                calories: kkal,
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

const fetchCategory =(req, res, response, index) => {
    const $ = cheerio.load(response.data);
    const element = $('#menu-menu-tajuk');
    let category, url, key;
    let category_list = [];
    
    // https://www.masakapahariini.com/
        // ambil element di menu bar
    $(element.find('ul.sub-menu')[index])
        .each((i, e) => {
            // loop untuk link
            $(e).find('li a').each((index, el) => {
                url = $(el).attr('href');
                key = $(el).attr('href').split('/');
                key = key[key.length - 2];
                category = key.replace('-', ' ')
                category_list.push({
                    category: category,
                    url: url,
                    key: key
                });
            })
        }
    )
        
    return res.send({
        method: req.method,
        status: true,
        results: category_list
    });
}

const fetchProduct =(req, res, response, index) => {
    const $ = cheerio.load(response.data);
    const element = $('#sitemap-page');
    let category, url, key;
    let category_list = [];
    
    // https://www.masakapahariini.com/site-map/
        // ambil element ke 4 dari .mb-5.mb-md-7 ul
    $(element.find('.mb-5.mb-md-7 ul')[index])
        .each((i, e) => {
            // loop untuk link
            $(e).find('li a').each((index, el) => {
                url = $(el).attr('href');
                key = $(el).attr('href').split('/');
                key = key[key.length - 2];
                category = key.replace('-', ' ')
                category_list.push({
                    category: category,
                    url: url,
                    key: key
                });
            })  
        }
    )
        
    return res.send({
        method: req.method,
        status: true,
        results: category_list
    });
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
            servings = $(e).find('.servings').find('small').text();
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
            const response = await services.fetchService(`${baseUrl}/`, res);
            return fetchCategory(req, res, response, 0);
            
        } catch (error) {
            throw error;
        }
    },

    article: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/artikel/`, res);
            return fetchArticle(req, res, response)
        } catch (error) {
            throw error;
        }
    },

    recipesByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/resep/${key}`, res);
            return fetchRecipes(req, res, response);

        } catch (error) {
            throw error;
        }
    },

    recipesCategoryByPage: async (req, res) => {
        try {
            const key = req.params.key;
            const page = req.params.page;
            const response = await services.fetchService(`${baseUrl}/resep/${key}/page/${page}`, res);
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
            let parseDuration, parseServings, parseDificulty, parseIngredient, rating;
            let duration, servings, difficulty;
            let servingsArr = [];
            let difficultyArr = [];
            let object = {};
            const elementHeader = $('._recipe-header');
            const elementDesc = $('._rich-content').first();
            const elementNeeded = $('._product-popup');
            const elementIngredients = $('div._recipe-ingredients');
            const elementTutorial = $('._recipe-steps');
            // const elementReview = $('section._kritique-reviews');
            title = elementHeader.find('header h1').text().replace('\n', '').trim();
            thumb = elementHeader.find('picture .image').attr('data-src');
            // rating = elementReview.find('.kr-review-header-title');
            // console.log(rating.html());
            if (thumb === undefined) {
                thumb = null;
            }
            user = elementHeader.children().last().find('.author').text().split('|');
            datePublished = user[1].trim(); // <= time
            user = user[0].trim(); // <= author
            
            servings = elementHeader.find('._kritique-rate div').attr('style');
            duration = elementHeader.find('._recipe-features').find('a:not([data-tracking])').text().trim();
            difficulty = elementHeader.find('._recipe-features a[data-tracking]').last().text().trim()
            calories = elementHeader.find('._recipe-features a.icon_fire').last().text().trim()

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
                    item_name: need_item.replace('\n', '').trim(),
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
                step = $(e).find('div.content').text().trim();
                resultStep = `${i + 1}. ${step}`
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
            const query = req.query.s || req.query.q;
            const response = await services.fetchService(`${baseUrl}/?s=${query}`, res);
            return fetchRecipes(req, res, response);
        } catch (error) {
            throw error;
        }
    },

    articleCategory: async (req, res) => {
        try {
            const response = await services.fetchService(`${baseUrl}/site-map/`, res);
            return fetchCategory(req, res, response, 1)
        } catch (error) {
            throw error;
        }
    },

    articleByCategory: async (req, res) => {
        try {
            const key = req.params.key;
            const response = await services.fetchService(`${baseUrl}/${key}`, res);
            return fetchArticle(req, res, response)
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
            const tagsElement = $('._global-tags div.d-flex');

            let title, thumbs, author, published, description, descriptionRaw;
            const tags = [];
            let article_object = {};
            title = element.find('._article-header').find('.title').text();
            author = element.find('.info').find('.author').text().split('|');
            published = author[1].trim();
            author = author[0].trim();
            thumbs = element.find('picture.thumbnail').find('img').attr('data-src');

            element.find('._rich-content').each((i, e) => {
                description = $(e).find('p').text().trim();
                descriptionRaw = $(e).html().trim();
            });

            tagsElement.find("a").each((i, e) => {
                tags.push({
                    category: $(e).text().trim().toLowerCase(),
                    url: $(e).attr('href'),
                    key: $(e).attr('href').split("=")[2],
                })
            })

            article_object.title = title.trim();
            article_object.thumb = thumbs.trim();
            article_object.author = author;
            article_object.date_published = published;
            article_object.description = description;
            article_object.descriptionRaw = descriptionRaw;
            article_object.tags = tags;

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