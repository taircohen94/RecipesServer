const express = require("express");
const router = express.Router();
const axios = require("axios");
const search_util = require("./utils/search_recipes");

// this functions gets all the recipes info by search query and number of 
// recipes required - 5 10 or 15, the default is 5
router.get("/search/query/:searchQuery/amount/:num",
    (req, res) => {
        var { searchQuery, num } = req.params;
        if (num != 5 && num != 10 && num != 15) {
            num = 5;
        }
        search_params = {};
        search_params.query = searchQuery;
        search_params.number = num;
        search_params.instructionsRequired = true;
        search_util.extractQueriesParams(req.query, search_params);
        search_util.searchForRecipes(search_params)
            .then((info_array) => res.send(info_array))
            .catch((error) => {
                res.sendStatus(error.response.status);
            });
    });

// this function returns 3 random recipes who have instructions!
router.get("/randomRecipes", async(req, res, next) => {
    try {
        random_params = {};
        random_params.number = 3;
        search_util.getRandomRecipes(random_params)
            .then((info_array) => res.send(info_array))
            .catch((error) => {
                res.sendStatus(error.response.status);
            });
    } catch (error) {
        next(error);
    }
});

// this function returns preview of recipe by his id
router.get("/preview/recipeId/:recipeId", async(req, res) => {
    const { recipeId } = req.params;
    search_params = {};
    search_params.recipeId = recipeId;

    search_util.getPreivewForRecipe(search_params)
        .then((info_array) => res.send(info_array))
        .catch((error) => {
            res.sendStatus(error.response.status);
        });
});

// this functions returns fullview of recipe by his id - with instructions, ingredients
// and serving 
router.get("/fullview/recipeId/:recipeId", (req, res) => {
    const { recipeId } = req.params;
    search_params = {};
    search_params.recipeId = recipeId;

    search_util.getFullviewForRecipe(search_params)
        .then((info_array) => res.send(info_array))
        .catch((error) => {
            res.sendStatus(error.response.status);
        });
});

module.exports = router;